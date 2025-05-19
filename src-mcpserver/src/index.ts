import { MCPServer, MCPServerConfig } from "@aicu/mcp-framework";
import path from "node:path";
import electron from 'electron';

const TOOLS_PATH = path.join(electron.app.getAppPath(), 'src-mcpserver', 'dist', 'tools');

interface UserOptions {
    proto: string;
    port: number;
    endpoint: string;
}

// 通过用户配置创建服务
const createServer = (opt: UserOptions) => {
    const opts: MCPServerConfig = {
        name: 'xhs-mcp',
        version: '0.5.20',
        basePath: TOOLS_PATH,
        transport: {
            type: opt.proto === 'sse' ? 'sse' : 'http-stream',
            options: {
                port: opt.port,
                endpoint: opt.endpoint.startsWith('/') ? opt.endpoint : `/${opt.endpoint}`,
                cors: {
                    allowOrigin: '*'
                }
            },
        }
    };
    const server = new MCPServer(opts);
    return server;
}

export = createServer;