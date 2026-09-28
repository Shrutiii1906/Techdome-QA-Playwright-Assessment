export type SecurityHeaderResult = {
  name: string;
  value?: string;
  present: boolean;
};

export function checkSecurityHeaders(
  headers: Record<string, string>
): SecurityHeaderResult[] {

  const requiredHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'x-frame-options',
  ];

  return requiredHeaders.map(
    (headerName) => ({
      name: headerName,
      value: headers[headerName],
      present: Boolean(
        headers[headerName]
      ),
    })
  );
}


export function getMissingSecurityHeaders(
  headers: Record<string, string>
): string[] {

  return checkSecurityHeaders(headers)
    .filter((header) => !header.present)
    .map((header) => header.name);
}


type SensitivePattern = {
  name: string;
  regex: RegExp;
};

const sensitivePatterns: SensitivePattern[] = [
  {
    name: 'Private key',
    regex:
      /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  },

  {
    name: 'Bearer token',
    regex:
      /Bearer\s+[A-Za-z0-9\-._~+/]+=*/i,
  },

  {
    name: 'Hardcoded password',
    regex:
      /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
  },

  {
    name: 'AWS secret access key',
    regex:
      /aws_secret_access_key\s*[:=]\s*["'][A-Za-z0-9/+=]{20,}["']/i,
  },
];


export function findSensitiveData(
  content: string
): string[] {

  return sensitivePatterns
    .filter((pattern) =>
      pattern.regex.test(content)
    )
    .map((pattern) =>
      pattern.name
    );
}