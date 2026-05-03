const patterns = [
  /(sk-[A-Za-z0-9_-]{16,})/g,
  /(ghp_[A-Za-z0-9]{20,})/g,
  /(Bearer\s+[A-Za-z0-9._-]+)/gi,
  /(postgres(?:ql)?:\/\/[^\s"']+)/gi,
  /(mongodb(?:\+srv)?:\/\/[^\s"']+)/gi,
  /(api[_-]?key\s*[:=]\s*[^\s,;]+)/gi,
  /(private[_-]?key\s*[:=]\s*[^\s,;]+)/gi,
  /(jwt\s*[:=]\s*[^\s,;]+)/gi
];

export function redactSecrets(text: string) {
  let out = text;
  for (const p of patterns) out = out.replace(p, "[REDACTED]");
  return out;
}
