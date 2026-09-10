export const NODE_TYPES = {
  webhook: 'webhook',
  httpRequest: 'httpRequest',
  condition: 'condition',
  transform: 'transform',
  delay: 'delay',
  setVariable: 'setVariable',
  email: 'email',
  database: 'database',
  code: 'code',
  loop: 'loop',
} as const;

export type NodeType = keyof typeof NODE_TYPES;

export const NODE_TYPE_LIST: NodeType[] = Object.keys(NODE_TYPES) as NodeType[];
