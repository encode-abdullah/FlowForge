import type { ExecutionContext } from '@flowforge/shared';

export interface NodeExecutor {
  type: string;
  execute(input: unknown, config: Record<string, unknown>, context: ExecutionContext): Promise<unknown>;
}

export class WebhookNode implements NodeExecutor {
  type = 'webhook';

  async execute(input: unknown): Promise<unknown> {
    return input;
  }
}

export class HttpRequestNode implements NodeExecutor {
  type = 'httpRequest';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { url, method = 'GET', headers = {}, body } = config as {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: unknown;
    };

    const response = await fetch(url, {
      method: method as string,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: method !== 'GET' ? JSON.stringify(body ?? input) : undefined,
    });

    const data = await response.json().catch(() => null);

    return { status: response.status, data };
  }
}

export class ConditionNode implements NodeExecutor {
  type = 'condition';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { variable, operator, value } = config as {
      variable: string;
      operator: string;
      value: unknown;
    };

    const inputData = input as Record<string, unknown>;
    const actualValue = inputData?.[variable];

    let result = false;

    switch (operator) {
      case 'eq':
        result = actualValue === value;
        break;
      case 'neq':
        result = actualValue !== value;
        break;
      case 'gt':
        result = Number(actualValue) > Number(value);
        break;
      case 'lt':
        result = Number(actualValue) < Number(value);
        break;
      case 'contains':
        result = String(actualValue).includes(String(value));
        break;
      default:
        result = false;
    }

    return { result, branch: result ? 'true' : 'false' };
  }
}

export class TransformNode implements NodeExecutor {
  type = 'transform';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { mapping } = config as { mapping: Record<string, string> };
    const inputData = input as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const [key, sourceKey] of Object.entries(mapping)) {
      output[key] = inputData?.[sourceKey];
    }

    return output;
  }
}

export class DelayNode implements NodeExecutor {
  type = 'delay';

  async execute(_input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { duration } = config as { duration: number };
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
    return { delayed: true, duration };
  }
}

export class SetVariableNode implements NodeExecutor {
  type = 'setVariable';

  async execute(input: unknown, config: Record<string, unknown>, context: ExecutionContext): Promise<unknown> {
    const { key, value } = config as { key: string; value: unknown };
    context.variables[key] = value;
    return { set: { [key]: value } };
  }
}

export class EmailNode implements NodeExecutor {
  type = 'email';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { to, subject, body } = config as { to: string; subject: string; body: string };

    console.log('[EmailNode] Sending email:', { to, subject, body });

    return { sent: true, to, subject };
  }
}

export class DatabaseNode implements NodeExecutor {
  type = 'database';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { operation, collection } = config as { operation: string; collection: string };

    console.log('[DatabaseNode] Operation:', { operation, collection });

    return { operation, collection, executed: true };
  }
}

export class CodeNode implements NodeExecutor {
  type = 'code';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { code } = config as { code: string };

    const fn = new Function('input', `return (async () => { ${code} })()`);
    return await fn(input);
  }
}

export class LoopNode implements NodeExecutor {
  type = 'loop';

  async execute(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const { arrayVariable } = config as { arrayVariable: string };
    const inputData = input as Record<string, unknown>;
    const items = inputData?.[arrayVariable];

    if (!Array.isArray(items)) {
      return { items: [], iterations: 0 };
    }

    return { items, iterations: items.length };
  }
}

export function getNodeExecutors(): Map<string, NodeExecutor> {
  const executors: NodeExecutor[] = [
    new WebhookNode(),
    new HttpRequestNode(),
    new ConditionNode(),
    new TransformNode(),
    new DelayNode(),
    new SetVariableNode(),
    new EmailNode(),
    new DatabaseNode(),
    new CodeNode(),
    new LoopNode(),
  ];

  const map = new Map<string, NodeExecutor>();
  for (const executor of executors) {
    map.set(executor.type, executor);
  }
  return map;
}
