// @name         XHS-MCP-Server
// @namespace    https://github.com/aicu-icu/xhs-mcp-server
// @version      1.3.13
// @description  小红书MCP服务器
// @author       aicu-icu
// @icon         https://broxy.dev/assets/logo.png
// @updateURL    https://raw.githubusercontent.com/aicu-icu/xhs-mcp-server/refs/heads/main/loader.user.js
// @match        https://www.xiaohongshu.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('[XHS-MCP-Server] 开始加载...');

    async function loadWithEval(url) {
        console.log(`[XHS-MCP-Server] 正在加载(eval): ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const code = await response.text();
        eval(code);
        console.log(`[XHS-MCP-Server] 加载完成: ${url}`);
    }

    function loadScript(url) {
        console.log(`[XHS-MCP-Server] 正在加载(script): ${url}`);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                console.log(`[XHS-MCP-Server] 加载完成: ${url}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`[XHS-MCP-Server] 加载失败: ${url}`);
                reject(new Error('Script load failed'));
            };
            document.head.appendChild(script);
        });
    }

    async function main() {
        await loadWithEval('https://raw.githubusercontent.com/aicu-icu/xhs-mcp-server/refs/heads/main/data-js/latest.js');
        await loadScript('https://broxy.dev/assets/broxy-v1.user.js');
        console.log('[XHS-MCP-Server] 所有脚本加载完成');
    }

    main();
})();
