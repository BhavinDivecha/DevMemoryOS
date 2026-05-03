const SECRET_PATTERNS = [
  /(sk-[A-Za-z0-9_-]{16,})/g,
  /(smem_[A-Za-z0-9]{16,})/g,
  /(postgres(?:ql)?:\/\/[^\s"']+)/gi,
  /(Bearer\s+[A-Za-z0-9._-]+)/gi,
  /(password\s*[:=]\s*[^\s,;]+)/gi,
  /(private[_-]?key\s*[:=]\s*[^\s,;]+)/gi,
  /(jwt\s*[:=]\s*[^\s,;]+)/gi
];

export function redactSecrets(value: any): any {
  if (typeof value === "string") {
    return SECRET_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "[REDACTED]"), value);
  }
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = redactSecrets(v);
    return out;
  }
  return value;
}
