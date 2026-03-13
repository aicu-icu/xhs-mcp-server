// @name         XHS-MCP-Server
// @namespace    https://github.com/aicu-icu/xhs-mcp-server
// @version      1.3.13
// @description  小红书MCP服务器
// @author       aicu-icu
// @icon         https://broxy.dev/assets/logo.png
// @updateURL    https://cdn.jsdelivr.net/gh/aicu-icu/xhs-mcp-server@main/loader.user.js
// @match        https://*/*
// @match        http://*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('[XHS-MCP-Server] 开始加载...');

    async function loadScript(url) {
        console.log(`[XHS-MCP-Server] 正在加载: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const code = await response.text();
            console.log(`[XHS-MCP-Server] 执行脚本: ${url}`);
            eval(code);
            console.log(`[XHS-MCP-Server] 加载完成: ${url}`);
        } catch (error) {
            console.warn(`[XHS-MCP-Server] fetch失败，尝试script注入: ${url}`, error);
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = () => {
                    console.log(`[XHS-MCP-Server] script注入成功: ${url}`);
                    resolve();
                };
                script.onerror = () => {
                    console.error(`[XHS-MCP-Server] script注入失败: ${url}`);
                    reject(new Error('Script load failed'));
                };
                document.head.appendChild(script);
            });
        }
    }

    async function main() {
        await loadScript('https://cdn.jsdelivr.net/gh/aicu-icu/xhs-mcp-server@main/data-js/latest.js');
        await loadScript('https://broxy.dev/assets/broxy-v1.user.js');
        console.log('[XHS-MCP-Server] 所有脚本加载完成');
    }

    main();
})();
