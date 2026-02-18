# FlowForge License Authentication Flows

**Document**: License Management and Authentication System
**Version**: 1.0.0
**Date**: 2025-09-17
**Security Expert**: FFT-Security
**Classification**: TECHNICAL IMPLEMENTATION

## 🎯 Authentication System Overview

### Multi-Tier License Architecture

FlowForge implements a comprehensive license authentication system supporting multiple tiers with varying features, user limits, and security controls.

```
┌─────────────────────────────────────────────────────────────┐
│                    LICENSE TIERS                            │
├─────────────────────────────────────────────────────────────┤
│ INDIVIDUAL ($29/month)                                      │
│ ├─ Single user license                                     │
│ ├─ 1 machine binding                                       │
│ ├─ Basic features                                          │
│ └─ Community support                                        │
├─────────────────────────────────────────────────────────────┤
│ TEAM ($99/month)                                           │
│ ├─ Up to 5 users                                          │
│ ├─ 10 machine bindings                                     │
│ ├─ Advanced features + integrations                        │
│ └─ Priority support                                         │
├─────────────────────────────────────────────────────────────┤
│ ENTERPRISE ($299/month)                                    │
│ ├─ Unlimited users                                         │
│ ├─ Unlimited machine bindings                              │
│ ├─ All features + custom integrations                      │
│ ├─ Dedicated support + SLA                                 │
│ └─ On-premise deployment options                           │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow Implementation

### 1. Initial Authentication Process

#### User Registration & License Activation
```typescript
// /src/security/auth/LicenseActivationFlow.ts
export class LicenseActivationFlow {
  private supabase: SupabaseClient;
  private cryptoService: CryptographicService;
  private machineBinding: MachineBindingService;

  async activateLicense(activationRequest: LicenseActivationRequest): Promise<LicenseActivationResult> {
    try {
      // Step 1: Validate activation code format
      this.validateActivationCodeFormat(activationRequest.activationCode);

      // Step 2: Machine fingerprinting
      const machineFingerprint = await this.machineBinding.generateFingerprint();

      // Step 3: Secure API call to license server
      const licenseData = await this.validateWithLicenseServer({
        activationCode: activationRequest.activationCode,
        machineFingerprint,
        userInfo: {
          email: activationRequest.email,
          organization: activationRequest.organization,
          hostname: os.hostname(),
          platform: os.platform()
        }
      });

      // Step 4: Generate local license certificate
      const localCertificate = await this.generateLocalCertificate(licenseData);

      // Step 5: Secure storage of license data
      await this.secureStorage.storeLicense(localCertificate);

      // Step 6: Initialize license monitoring
      this.startLicenseMonitoring(localCertificate);

      return {
        success: true,
        licenseInfo: licenseData,
        expiresAt: licenseData.expiresAt,
        features: licenseData.features,
        machineId: machineFingerprint.hash
      };

    } catch (error) {
      this.logSecurityEvent('LICENSE_ACTIVATION_FAILED', {
        error: error.message,
        activationCode: this.hashActivationCode(activationRequest.activationCode)
      });

      throw new LicenseActivationError('License activation failed', error);
    }
  }

  private async generateLocalCertificate(licenseData: LicenseData): Promise<LocalLicenseCertificate> {
    // Create tamper-resistant local certificate
    const certificate = {
      licenseKey: licenseData.key,
      tier: licenseData.tier,
      expiresAt: licenseData.expiresAt,
      features: licenseData.features,
      maxUsers: licenseData.maxUsers,
      machineBindings: licenseData.machineBindings,
      issuedAt: Date.now(),
      issuer: 'flowforge-license-authority'
    };

    // Digital signature
    const signature = await this.cryptoService.signData(certificate);

    // Encryption with machine-specific key
    const encrypted = await this.cryptoService.encryptWithMachineKey(certificate);

    return {
      encrypted,
      signature,
      metadata: {
        version: '1.0',
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-SHA256'
      }
    };
  }
}
```

#### Supabase Authentication Integration
```typescript
// /src/security/auth/SupabaseAuthService.ts
export class SupabaseAuthService {
  private supabase: SupabaseClient;
  private sessionManager: SessionManager;

  constructor(config: SupabaseConfig) {
    this.supabase = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  }

  async authenticateUser(credentials: UserCredentials): Promise<AuthenticationResult> {
    try {
      // Primary authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw new AuthenticationError(error.message);

      // License validation
      const licenseValidation = await this.validateUserLicense(data.user.id);

      // Machine binding check
      const machineValidation = await this.validateMachineBinding(
        data.user.id,
        licenseValidation.licenseInfo
      );

      // Generate secure session
      const session = await this.sessionManager.createSecureSession({
        userId: data.user.id,
        email: data.user.email,
        licenseInfo: licenseValidation.licenseInfo,
        machineId: machineValidation.machineId
      });

      return {
        success: true,
        user: data.user,
        session,
        licenseInfo: licenseValidation.licenseInfo,
        permissions: this.calculatePermissions(licenseValidation.licenseInfo)
      };

    } catch (error) {
      this.logAuthenticationAttempt(credentials.email, false, error.message);
      throw error;
    }
  }

  async refreshSession(refreshToken: string): Promise<SessionRefreshResult> {
    try {
      // Refresh Supabase session
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) throw new SessionRefreshError(error.message);

      // Re-validate license (cached for performance)
      const licenseValidation = await this.validateUserLicenseCached(data.user.id);

      // Check for license changes or expiry
      if (!licenseValidation.isValid) {
        throw new LicenseExpiredError('License no longer valid');
      }

      return {
        success: true,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(data.session.expires_at * 1000),
        licenseInfo: licenseValidation.licenseInfo
      };

    } catch (error) {
      this.logSessionRefreshAttempt(refreshToken, false, error.message);
      throw error;
    }
  }
}
```

### 2. License Validation Process

#### Real-time License Validation
```typescript
// /src/security/licensing/LicenseValidator.ts
export class LicenseValidator {
  private readonly VALIDATION_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
  private readonly OFFLINE_GRACE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days
  private validationCache: Map<string, CachedValidation> = new Map();

  async validateLicense(licenseKey: string): Promise<LicenseValidationResult> {
    // Check cache first
    const cached = this.getCachedValidation(licenseKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.result;
    }

    try {
      // Online validation
      const result = await this.performOnlineValidation(licenseKey);
      this.cacheValidation(licenseKey, result);
      return result;

    } catch (error) {
      // Fallback to offline validation during network issues
      return this.performOfflineValidation(licenseKey);
    }
  }

  private async performOnlineValidation(licenseKey: string): Promise<LicenseValidationResult> {
    const machineFingerprint = await MachineBinding.generateMachineFingerprint();

    const validationRequest = {
      licenseKey,
      machineId: machineFingerprint.hash,
      timestamp: Date.now(),
      version: process.env.FF_VERSION || '2.0.0'
    };

    // Sign request to prevent tampering
    const signature = this.signValidationRequest(validationRequest);

    const response = await this.licenseAPI.validateLicense({
      ...validationRequest,
      signature
    });

    if (!response.isValid) {
      throw new LicenseValidationError(response.reason);
    }

    // Verify machine binding
    if (!response.licenseInfo.machineBindings.includes(machineFingerprint.hash)) {
      if (response.licenseInfo.machineBindings.length >= response.licenseInfo.maxMachines) {
        throw new MachineBindingError('Maximum machine limit reached');
      }

      // Request machine binding
      await this.requestMachineBinding(licenseKey, machineFingerprint);
    }

    return {
      isValid: true,
      licenseInfo: response.licenseInfo,
      validUntil: new Date(Date.now() + this.VALIDATION_CACHE_TTL),
      features: this.parseFeatures(response.licenseInfo),
      restrictions: this.parseRestrictions(response.licenseInfo)
    };
  }

  private async performOfflineValidation(licenseKey: string): Promise<LicenseValidationResult> {
    // Load stored license certificate
    const certificate = await this.secureStorage.loadLicenseCertificate();

    if (!certificate) {
      throw new LicenseValidationError('No valid license found - online validation required');
    }

    // Verify certificate integrity
    const isIntegrityValid = await this.verifyCertificateIntegrity(certificate);
    if (!isIntegrityValid) {
      throw new LicenseValidationError('License certificate has been tampered with');
    }

    // Check expiration
    const lastValidation = certificate.lastValidation;
    const timeSinceValidation = Date.now() - lastValidation;

    if (timeSinceValidation > this.OFFLINE_GRACE_PERIOD) {
      throw new LicenseValidationError('License requires online validation');
    }

    // Decrypt license data
    const licenseData = await this.cryptoService.decryptLicenseData(certificate.encrypted);

    return {
      isValid: true,
      licenseInfo: licenseData,
      validUntil: new Date(lastValidation + this.OFFLINE_GRACE_PERIOD),
      features: this.parseFeatures(licenseData),
      restrictions: this.parseRestrictions(licenseData),
      isOffline: true
    };
  }
}
```

#### Machine Binding Management
```typescript
// /src/security/binding/MachineBindingManager.ts
export class MachineBindingManager {
  private readonly MAX_BINDING_DEVIATIONS = 2;

  async bindMachine(
    licenseKey: string,
    machineFingerprint: MachineFingerprint
  ): Promise<MachineBindingResult> {
    try {
      // Check if machine is already bound
      const existingBinding = await this.checkExistingBinding(licenseKey, machineFingerprint);
      if (existingBinding) {
        return { success: true, binding: existingBinding };
      }

      // Request new machine binding
      const bindingRequest = {
        licenseKey,
        machineFingerprint,
        timestamp: Date.now(),
        requestInfo: {
          hostname: os.hostname(),
          platform: os.platform(),
          userAgent: this.generateUserAgent(),
          requestSource: 'flowforge-cli'
        }
      };

      const response = await this.licenseAPI.requestMachineBinding(bindingRequest);

      if (!response.approved) {
        throw new MachineBindingError(response.reason);
      }

      // Store binding locally
      await this.storeMachineBinding(response.binding);

      return {
        success: true,
        binding: response.binding,
        isNewBinding: true
      };

    } catch (error) {
      this.logBindingAttempt(licenseKey, machineFingerprint, false, error.message);
      throw error;
    }
  }

  async validateMachineBinding(
    storedBinding: MachineBinding,
    currentFingerprint: MachineFingerprint
  ): Promise<MachineBindingValidation> {
    let deviations = 0;
    const deviationDetails: string[] = [];

    // Check each component of the fingerprint
    if (storedBinding.fingerprint.hostname !== currentFingerprint.hostname) {
      deviations++;
      deviationDetails.push('hostname');
    }

    if (storedBinding.fingerprint.platform !== currentFingerprint.platform) {
      deviations++;
      deviationDetails.push('platform');
    }

    if (storedBinding.fingerprint.cpuModel !== currentFingerprint.cpuModel) {
      deviations++;
      deviationDetails.push('cpu');
    }

    // Memory changes are allowed within reason (±1GB)
    const memoryDiff = Math.abs(
      storedBinding.fingerprint.totalMemory - currentFingerprint.totalMemory
    );
    if (memoryDiff > 1024 * 1024 * 1024) {
      deviations++;
      deviationDetails.push('memory');
    }

    // Network interface changes are common and acceptable
    if (storedBinding.fingerprint.networkInterfaces !== currentFingerprint.networkInterfaces) {
      // This is informational only, doesn't count as deviation
      deviationDetails.push('network-interfaces');
    }

    const isValid = deviations <= this.MAX_BINDING_DEVIATIONS;
    const riskLevel = this.calculateRiskLevel(deviations, deviationDetails);

    return {
      isValid,
      deviations,
      deviationDetails,
      riskLevel,
      recommendation: this.getBindingRecommendation(deviations, riskLevel)
    };
  }

  private calculateRiskLevel(deviations: number, details: string[]): RiskLevel {
    if (deviations === 0) return 'LOW';

    // High-risk deviations
    const highRiskChanges = ['platform', 'cpu'];
    const hasHighRiskChanges = details.some(detail => highRiskChanges.includes(detail));

    if (hasHighRiskChanges || deviations > 2) return 'HIGH';
    if (deviations > 1) return 'MEDIUM';

    return 'LOW';
  }
}
```

### 3. Secure Session Management

#### Session Security Implementation
```typescript
// /src/security/session/SecureSessionManager.ts
export class SecureSessionManager {
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REFRESH_THRESHOLD = 6 * 60 * 60 * 1000; // 6 hours
  private activeSessions: Map<string, SecureSession> = new Map();

  async createSecureSession(sessionData: SessionCreationData): Promise<SecureSession> {
    const sessionId = this.generateSecureSessionId();
    const machineFingerprint = await MachineBinding.generateMachineFingerprint();

    const session: SecureSession = {
      id: sessionId,
      userId: sessionData.userId,
      email: sessionData.email,
      licenseInfo: sessionData.licenseInfo,
      machineId: machineFingerprint.hash,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT,
      permissions: this.calculatePermissions(sessionData.licenseInfo),
      securityLevel: this.calculateSecurityLevel(sessionData.licenseInfo),
      encryptedToken: await this.generateEncryptedToken(sessionData)
    };

    // Store session securely
    await this.storeSession(session);

    // Register for automatic cleanup
    this.scheduleSessionCleanup(session);

    return session;
  }

  async validateSession(sessionToken: string): Promise<SessionValidationResult> {
    try {
      // Decrypt and parse session token
      const sessionData = await this.decryptSessionToken(sessionToken);

      // Retrieve stored session
      const session = this.activeSessions.get(sessionData.sessionId);
      if (!session) {
        throw new SessionValidationError('Session not found');
      }

      // Check expiration
      if (Date.now() > session.expiresAt) {
        await this.cleanupSession(session.id);
        throw new SessionValidationError('Session expired');
      }

      // Validate machine binding
      const currentMachineId = (await MachineBinding.generateMachineFingerprint()).hash;
      if (session.machineId !== currentMachineId) {
        await this.cleanupSession(session.id);
        throw new SessionValidationError('Session bound to different machine');
      }

      // Check for license changes
      const licenseValidation = await this.validateSessionLicense(session);
      if (!licenseValidation.isValid) {
        await this.cleanupSession(session.id);
        throw new SessionValidationError('License no longer valid');
      }

      // Update last activity
      session.lastActivity = Date.now();

      // Check if refresh is needed
      const needsRefresh = this.shouldRefreshSession(session);

      return {
        isValid: true,
        session,
        needsRefresh,
        remainingTime: session.expiresAt - Date.now()
      };

    } catch (error) {
      this.logSessionValidationAttempt(sessionToken, false, error.message);
      throw error;
    }
  }

  private async generateEncryptedToken(sessionData: SessionCreationData): Promise<string> {
    const tokenPayload = {
      sessionId: this.generateSecureSessionId(),
      userId: sessionData.userId,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex'),
      machineId: (await MachineBinding.generateMachineFingerprint()).hash
    };

    // Sign the payload
    const signature = this.signTokenPayload(tokenPayload);

    // Encrypt with session-specific key
    const encrypted = await this.encryptTokenPayload({
      ...tokenPayload,
      signature
    });

    return encrypted;
  }

  private shouldRefreshSession(session: SecureSession): boolean {
    const timeSinceCreation = Date.now() - session.createdAt;
    return timeSinceCreation > this.REFRESH_THRESHOLD;
  }

  async refreshSession(sessionId: string): Promise<SessionRefreshResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new SessionValidationError('Session not found for refresh');
    }

    // Re-validate license
    const licenseValidation = await this.validateSessionLicense(session);
    if (!licenseValidation.isValid) {
      throw new SessionValidationError('License validation failed during refresh');
    }

    // Create new session with updated data
    const refreshedSession = await this.createSecureSession({
      userId: session.userId,
      email: session.email,
      licenseInfo: licenseValidation.licenseInfo
    });

    // Clean up old session
    await this.cleanupSession(sessionId);

    return {
      success: true,
      session: refreshedSession,
      newToken: refreshedSession.encryptedToken
    };
  }
}
```

### 4. Feature Access Control

#### Permission-Based Feature Access
```typescript
// /src/security/permissions/FeatureAccessControl.ts
export class FeatureAccessControl {
  private readonly FEATURE_DEFINITIONS: FeatureDefinitions = {
    'basic-commands': {
      tier: 'individual',
      description: 'Basic FlowForge commands',
      requiredPermissions: ['flowforge:basic']
    },
    'advanced-integrations': {
      tier: 'team',
      description: 'Advanced provider integrations',
      requiredPermissions: ['flowforge:integrations']
    },
    'custom-agents': {
      tier: 'team',
      description: 'Custom AI agent creation',
      requiredPermissions: ['flowforge:agents:custom']
    },
    'enterprise-sso': {
      tier: 'enterprise',
      description: 'Single Sign-On integration',
      requiredPermissions: ['flowforge:sso']
    },
    'bulk-operations': {
      tier: 'enterprise',
      description: 'Bulk project operations',
      requiredPermissions: ['flowforge:bulk']
    },
    'audit-logging': {
      tier: 'enterprise',
      description: 'Comprehensive audit logging',
      requiredPermissions: ['flowforge:audit']
    }
  };

  checkFeatureAccess(
    featureId: string,
    licenseInfo: LicenseInfo,
    userPermissions: string[]
  ): FeatureAccessResult {
    const feature = this.FEATURE_DEFINITIONS[featureId];
    if (!feature) {
      return {
        hasAccess: false,
        reason: 'FEATURE_NOT_FOUND',
        featureId
      };
    }

    // Check license tier
    if (!this.checkTierAccess(feature.tier, licenseInfo.tier)) {
      return {
        hasAccess: false,
        reason: 'INSUFFICIENT_LICENSE_TIER',
        featureId,
        requiredTier: feature.tier,
        currentTier: licenseInfo.tier
      };
    }

    // Check specific permissions
    const hasRequiredPermissions = feature.requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return {
        hasAccess: false,
        reason: 'INSUFFICIENT_PERMISSIONS',
        featureId,
        requiredPermissions: feature.requiredPermissions,
        userPermissions
      };
    }

    // Check usage quotas
    const quotaCheck = this.checkUsageQuotas(featureId, licenseInfo);
    if (!quotaCheck.allowed) {
      return {
        hasAccess: false,
        reason: 'QUOTA_EXCEEDED',
        featureId,
        quotaInfo: quotaCheck
      };
    }

    return {
      hasAccess: true,
      featureId,
      feature
    };
  }

  private checkTierAccess(requiredTier: LicenseTier, userTier: LicenseTier): boolean {
    const tierHierarchy = {
      'individual': 1,
      'team': 2,
      'enterprise': 3
    };

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  }

  private checkUsageQuotas(featureId: string, licenseInfo: LicenseInfo): QuotaCheckResult {
    const quotas = licenseInfo.usageQuotas;
    const usage = this.getCurrentUsage(featureId, licenseInfo.userId);

    switch (featureId) {
      case 'custom-agents':
        return {
          allowed: usage.customAgents < quotas.maxCustomAgents,
          current: usage.customAgents,
          limit: quotas.maxCustomAgents,
          resetDate: quotas.resetDate
        };

      case 'bulk-operations':
        return {
          allowed: usage.bulkOperations < quotas.maxBulkOperations,
          current: usage.bulkOperations,
          limit: quotas.maxBulkOperations,
          resetDate: quotas.resetDate
        };

      default:
        return { allowed: true };
    }
  }
}
```

### 5. Offline License Management

#### Offline Grace Period Implementation
```typescript
// /src/security/licensing/OfflineLicenseManager.ts
export class OfflineLicenseManager {
  private readonly OFFLINE_GRACE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly OFFLINE_WARNING_THRESHOLD = 5 * 24 * 60 * 60 * 1000; // 5 days
  private readonly RETRY_INTERVALS = [1000, 5000, 15000, 60000]; // Progressive backoff

  async handleOfflineScenario(licenseKey: string): Promise<OfflineLicenseResult> {
    // Load cached license data
    const cachedLicense = await this.loadCachedLicense(licenseKey);
    if (!cachedLicense) {
      throw new LicenseValidationError('No cached license available for offline use');
    }

    // Check cache validity
    const cacheAge = Date.now() - cachedLicense.lastValidation;

    if (cacheAge > this.OFFLINE_GRACE_PERIOD) {
      // Grace period exceeded - require online validation
      throw new LicenseValidationError('Offline grace period exceeded - online validation required');
    }

    // Calculate remaining offline time
    const remainingOfflineTime = this.OFFLINE_GRACE_PERIOD - cacheAge;

    // Check if warning threshold reached
    const shouldWarn = remainingOfflineTime < this.OFFLINE_WARNING_THRESHOLD;

    // Attempt background reconnection
    this.attemptBackgroundReconnection(licenseKey);

    return {
      isValid: true,
      licenseInfo: cachedLicense.licenseInfo,
      isOfflineMode: true,
      remainingOfflineTime,
      shouldWarnUser: shouldWarn,
      warningMessage: shouldWarn ? this.generateOfflineWarning(remainingOfflineTime) : null
    };
  }

  private async attemptBackgroundReconnection(licenseKey: string): Promise<void> {
    // Use progressive backoff for reconnection attempts
    for (let i = 0; i < this.RETRY_INTERVALS.length; i++) {
      setTimeout(async () => {
        try {
          const onlineValidation = await this.licenseValidator.performOnlineValidation(licenseKey);

          // Update cached license with fresh data
          await this.updateCachedLicense(licenseKey, onlineValidation);

          this.notifyReconnectionSuccess();
          return; // Exit retry loop on success

        } catch (error) {
          // Continue with next retry interval
          if (i === this.RETRY_INTERVALS.length - 1) {
            // Final attempt failed
            this.logOfflineReconnectionFailure(error);
          }
        }
      }, this.RETRY_INTERVALS[i]);
    }
  }

  private generateOfflineWarning(remainingTime: number): string {
    const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) {
      return `FlowForge will require online license validation in ${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}.`;
    } else {
      return `FlowForge will require online license validation in ${hours} hour${hours !== 1 ? 's' : ''}. Please ensure internet connectivity.`;
    }
  }
}
```

## 🔄 License Lifecycle Management

### Automatic License Renewal
```typescript
// /src/security/licensing/LicenseRenewalManager.ts
export class LicenseRenewalManager {
  private readonly RENEWAL_WARNING_DAYS = [30, 14, 7, 3, 1];
  private readonly AUTO_RENEWAL_ENABLED = true;

  async checkLicenseRenewal(licenseInfo: LicenseInfo): Promise<RenewalCheckResult> {
    const daysUntilExpiration = this.calculateDaysUntilExpiration(licenseInfo.expiresAt);

    // Check if renewal warning is needed
    if (this.RENEWAL_WARNING_DAYS.includes(daysUntilExpiration)) {
      return {
        needsAttention: true,
        type: 'RENEWAL_WARNING',
        daysRemaining: daysUntilExpiration,
        message: this.generateRenewalWarning(daysUntilExpiration),
        actions: this.getRenewalActions(licenseInfo)
      };
    }

    // Check if license has expired
    if (daysUntilExpiration <= 0) {
      return {
        needsAttention: true,
        type: 'EXPIRED',
        daysRemaining: 0,
        message: 'Your FlowForge license has expired. Please renew to continue using all features.',
        actions: this.getExpiredLicenseActions(licenseInfo)
      };
    }

    // Check for auto-renewal
    if (this.AUTO_RENEWAL_ENABLED && licenseInfo.autoRenewal) {
      if (daysUntilExpiration <= 7) {
        return this.processAutoRenewal(licenseInfo);
      }
    }

    return {
      needsAttention: false,
      type: 'VALID',
      daysRemaining: daysUntilExpiration
    };
  }

  private async processAutoRenewal(licenseInfo: LicenseInfo): Promise<RenewalCheckResult> {
    try {
      const renewalResult = await this.licenseAPI.processAutoRenewal({
        licenseKey: licenseInfo.key,
        userId: licenseInfo.userId,
        paymentMethodId: licenseInfo.paymentMethodId
      });

      if (renewalResult.success) {
        // Update local license with new expiration date
        await this.updateLicenseExpiration(licenseInfo.key, renewalResult.newExpirationDate);

        return {
          needsAttention: true,
          type: 'AUTO_RENEWED',
          daysRemaining: this.calculateDaysUntilExpiration(renewalResult.newExpirationDate),
          message: `Your FlowForge license has been automatically renewed until ${renewalResult.newExpirationDate.toLocaleDateString()}.`,
          actions: []
        };
      } else {
        return {
          needsAttention: true,
          type: 'AUTO_RENEWAL_FAILED',
          daysRemaining: this.calculateDaysUntilExpiration(licenseInfo.expiresAt),
          message: `Auto-renewal failed: ${renewalResult.reason}. Please update your payment method.`,
          actions: this.getFailedRenewalActions(licenseInfo)
        };
      }

    } catch (error) {
      this.logRenewalError(licenseInfo.key, error);

      return {
        needsAttention: true,
        type: 'AUTO_RENEWAL_ERROR',
        daysRemaining: this.calculateDaysUntilExpiration(licenseInfo.expiresAt),
        message: 'Auto-renewal encountered an error. Please check your account or contact support.',
        actions: this.getErrorRenewalActions(licenseInfo)
      };
    }
  }
}
```

## 📊 Usage Analytics & Monitoring

### License Usage Analytics
```typescript
// /src/security/analytics/LicenseUsageAnalytics.ts
export class LicenseUsageAnalytics {
  private readonly ANALYTICS_ENDPOINT = 'https://analytics.flowforge.dev/api/v1';

  async trackLicenseUsage(usageEvent: LicenseUsageEvent): Promise<void> {
    try {
      const analyticsPayload = {
        eventType: usageEvent.type,
        userId: this.hashUserId(usageEvent.userId),
        licenseKey: this.hashLicenseKey(usageEvent.licenseKey),
        timestamp: Date.now(),
        sessionId: usageEvent.sessionId,
        machineId: this.hashMachineId(usageEvent.machineId),
        features: usageEvent.features,
        metadata: {
          version: process.env.FF_VERSION || '2.0.0',
          platform: os.platform(),
          nodeVersion: process.version
        }
      };

      await this.sendAnalytics('/license/usage', analyticsPayload);

    } catch (error) {
      // Fail silently to not impact user experience
      if (process.env.NODE_ENV === 'development') {
        console.warn('License analytics reporting failed:', error.message);
      }
    }
  }

  async generateUsageReport(licenseKey: string, period: ReportPeriod): Promise<UsageReport> {
    const usageData = await this.getLicenseUsageData(licenseKey, period);

    return {
      licenseKey: this.hashLicenseKey(licenseKey),
      period,
      summary: {
        totalSessions: usageData.sessions.length,
        uniqueUsers: new Set(usageData.sessions.map(s => s.userId)).size,
        uniqueMachines: new Set(usageData.sessions.map(s => s.machineId)).size,
        featuresUsed: this.analyzeFeatureUsage(usageData),
        peakUsageHours: this.calculatePeakUsage(usageData)
      },
      compliance: {
        isCompliant: this.checkLicenseCompliance(usageData),
        violations: this.detectUsageViolations(usageData),
        recommendations: this.generateComplianceRecommendations(usageData)
      }
    };
  }

  private checkLicenseCompliance(usageData: LicenseUsageData): boolean {
    // Check user limits
    const uniqueUsers = new Set(usageData.sessions.map(s => s.userId)).size;
    if (uniqueUsers > usageData.licenseInfo.maxUsers) {
      return false;
    }

    // Check machine limits
    const uniqueMachines = new Set(usageData.sessions.map(s => s.machineId)).size;
    if (uniqueMachines > usageData.licenseInfo.maxMachines) {
      return false;
    }

    // Check feature usage compliance
    const unauthorizedFeatures = this.detectUnauthorizedFeatureUsage(usageData);
    if (unauthorizedFeatures.length > 0) {
      return false;
    }

    return true;
  }
}
```

## 🔧 Integration with FlowForge Core

### License-Aware Command Execution
```typescript
// /src/core/LicenseAwareCommandExecutor.ts
export class LicenseAwareCommandExecutor {
  private licenseValidator: LicenseValidator;
  private featureAccessControl: FeatureAccessControl;
  private usageAnalytics: LicenseUsageAnalytics;

  async executeCommand(command: FlowForgeCommand, context: ExecutionContext): Promise<CommandResult> {
    try {
      // Validate license before command execution
      const licenseValidation = await this.licenseValidator.validateLicense(context.licenseKey);
      if (!licenseValidation.isValid) {
        throw new LicenseValidationError('Invalid license for command execution');
      }

      // Check feature access
      const featureAccess = this.featureAccessControl.checkFeatureAccess(
        command.requiredFeature,
        licenseValidation.licenseInfo,
        context.userPermissions
      );

      if (!featureAccess.hasAccess) {
        return this.handleFeatureAccessDenied(command, featureAccess);
      }

      // Track usage
      await this.usageAnalytics.trackLicenseUsage({
        type: 'COMMAND_EXECUTION',
        userId: context.userId,
        licenseKey: context.licenseKey,
        sessionId: context.sessionId,
        machineId: context.machineId,
        features: [command.requiredFeature],
        commandName: command.name
      });

      // Execute command
      const result = await command.execute(context);

      return result;

    } catch (error) {
      // Track failed executions
      await this.usageAnalytics.trackLicenseUsage({
        type: 'COMMAND_EXECUTION_FAILED',
        userId: context.userId,
        licenseKey: context.licenseKey,
        sessionId: context.sessionId,
        machineId: context.machineId,
        features: [command.requiredFeature],
        commandName: command.name,
        error: error.message
      });

      throw error;
    }
  }

  private handleFeatureAccessDenied(
    command: FlowForgeCommand,
    featureAccess: FeatureAccessResult
  ): CommandResult {
    const upgradeMessage = this.generateUpgradeMessage(featureAccess);

    return {
      success: false,
      error: 'FEATURE_ACCESS_DENIED',
      message: `Access to '${command.name}' requires ${featureAccess.requiredTier} license tier or higher.`,
      upgradeInfo: {
        currentTier: featureAccess.currentTier,
        requiredTier: featureAccess.requiredTier,
        upgradeUrl: this.generateUpgradeUrl(featureAccess),
        message: upgradeMessage
      }
    };
  }
}
```

## 🎯 Deployment Checklist

### License System Deployment
- [ ] Supabase authentication configured
- [ ] License API endpoints secured
- [ ] Machine binding system tested
- [ ] Offline grace period verified
- [ ] Session management implemented
- [ ] Feature access controls active
- [ ] Usage analytics tracking
- [ ] Renewal notifications working
- [ ] Error handling comprehensive
- [ ] Security monitoring enabled

---

**Next Steps**:
1. Implement core authentication classes
2. Set up Supabase integration
3. Create license validation system
4. Test offline scenarios
5. Deploy license monitoring

**Security Contact**: FFT-Security Team
**Review Date**: 2025-10-17 (Monthly review)
**Classification**: TECHNICAL IMPLEMENTATION