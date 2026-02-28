# 🔒 Security Policy

## 📋 Table of Contents

- [🛡️ Supported Versions](#️-supported-versions)
- [🚨 Reporting a Vulnerability](#-reporting-a-vulnerability)
- [🔍 What to Report](#-what-to-report)
- [📧 How to Report](#-how-to-report)
- [⏱️ Response Time](#️-response-time)
- [🏆 Recognition](#-recognition)
- [🛡️ Security Best Practices](#️-security-best-practices)

## 🛡️ Supported Versions

| Version | Supported | Security Updates |
|---------|-----------|-------------------|
| 2.2.x   | ✅ Yes    | ✅ Yes            |
| 2.1.x   | ✅ Yes    | ✅ Yes            |
| 2.0.x   | ⚠️ Limited | ⚠️ Critical only  |
| < 2.0   | ❌ No     | ❌ No             |

## 🚨 Reporting a Vulnerability

We take security seriously and appreciate your efforts to responsibly disclose vulnerabilities.

### 🔍 What to Report

Please report any of the following security vulnerabilities:

- **Authentication Issues**: Bypass, weak authentication, session management
- **Authorization Flaws**: Privilege escalation, access control bypass
- **Injection Vulnerabilities**: SQL injection, XSS, command injection
- **Data Exposure**: Sensitive data leaks, information disclosure
- **Cross-Site Issues**: CSRF, XSS, clickjacking
- **Infrastructure**: Server misconfigurations, exposed services
- **Third-party**: Vulnerabilities in dependencies

### 📧 How to Report

**Primary Method (Preferred)**
- **Email**: security@heartopia.fr
- **PGP Key**: Available upon request for encrypted communications

**Alternative Methods**
- **Discord**: Direct message to server administrators
- **GitHub**: Create a private issue (mention "SECURITY" in title)

### 📝 Report Format

Please include the following information in your report:

```markdown
## Vulnerability Summary
[Brief description of the vulnerability]

## Affected Versions
[List of affected versions]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Proof of Concept
[Code snippets, screenshots, or video]

## Impact Assessment
[Severity level: Critical/High/Medium/Low]
[Potential impact on users/system]

## Suggested Fix (Optional)
[Your recommendations for fixing]
```

## ⏱️ Response Time

We commit to the following response times:

- **Initial Response**: Within 24 hours (weekdays)
- **Triage**: Within 3 business days
- **Resolution**: Within 30 days (depending on complexity)
- **Public Disclosure**: After fix is deployed (typically within 90 days)

### Response Process

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Triage**: We'll assess the severity and impact
3. **Investigation**: We'll reproduce and validate the vulnerability
4. **Remediation**: We'll develop and test a fix
5. **Deployment**: We'll deploy the fix to production
6. **Disclosure**: We'll publicly disclose (with credit if desired)

## 🏆 Recognition

We value and recognize security researchers who help us improve our security:

### Hall of Fame

Researchers who report qualifying vulnerabilities will be:

- Listed in our Security Hall of Fame
- Mentioned in security advisories
- Eligible for monetary rewards (if applicable)
- Invited to join our security beta program

### Reward Program

- **Critical**: $500 - $2000
- **High**: $200 - $1000  
- **Medium**: $100 - $500
- **Low**: $50 - $200

*Rewards are at our discretion and based on impact and exploitability*

## 🛡️ Security Best Practices

### For Developers

```typescript
// Input Validation
import { z } from 'zod';

const userSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
});

// SQL Injection Prevention
const getUser = async (id: number) => {
  // ✅ Good: Use parameterized queries
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  
  // ❌ Bad: String concatenation
  // const [rows] = await pool.query(`SELECT * FROM users WHERE id = ${id}`);
  
  return rows[0];
};

// XSS Prevention
import DOMPurify from 'dompurify';

const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};
```

### For Administrators

1. **Keep Software Updated**
   - Regularly update Node.js and dependencies
   - Apply security patches promptly
   - Monitor security advisories

2. **Secure Configuration**
   ```env
   # Environment Variables
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-here
   DB_ENCRYPTION=true
   
   # Security Headers
   HELMET_ENABLED=true
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Database Security**
   ```sql
   -- Create dedicated user with limited privileges
   CREATE USER 'heartopia_app'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON heartopia.* TO 'heartopia_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

### For Users

1. **Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Avoid dictionary words and personal information

2. **Two-Factor Authentication**
   - Enable 2FA when available
   - Use authenticator apps over SMS
   - Keep backup codes secure

3. **Phishing Awareness**
   - Verify sender email addresses
   - Don't click suspicious links
   - Report phishing attempts

## 🔐 Security Features

### Built-in Protections

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection**: Parameterized queries throughout
- **XSS Protection**: Content sanitization with DOMPurify
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Rate Limiting**: API endpoint rate limiting
- **HTTPS Enforcement**: SSL/TLS for all communications
- **Security Headers**: HSTS, CSP, and other security headers

### Monitoring and Logging

- **Security Events**: Login attempts, permission changes
- **Audit Logs**: Complete audit trail for admin actions
- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: Anomaly detection for unusual activity

## 📞 Contact Information

### Security Team

- **Email**: security@heartopia.fr
- **PGP**: Available upon request
- **Discord**: Server administrators
- **GitHub**: Private issues with "SECURITY" prefix

### General Inquiries

- **Email**: contact@heartopia.fr
- **Discord**: [Join our server](https://discord.gg/heartopiafr)
- **Website**: [heartopia.fr](https://heartopia.fr)

## 📄 Legal Information

### Responsible Disclosure Policy

We follow responsible disclosure principles:

- We will not take legal action against researchers who:
  - Report vulnerabilities in good faith
  - Do not exploit the vulnerability
  - Provide us reasonable time to respond
  - Do not disclose publicly before we fix the issue

- We reserve the right to take legal action against:
  - Malicious exploitation of vulnerabilities
  - Public disclosure before fix deployment
  - Extortion or blackmail attempts

### Privacy

All security reports are treated as confidential. We will not share your personal information without your explicit consent.

---

Thank you for helping keep Heartopia Wiki secure! 🛡️
