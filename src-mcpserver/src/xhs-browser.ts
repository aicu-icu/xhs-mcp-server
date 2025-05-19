import path from 'node:path';
import fs from 'node:fs'
import electron from 'electron';
import { is } from '@electron-toolkit/utils'


// 配置管理
const configFilePath = path.join(electron.app.getPath('userData'), 'config.json')
function loadConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // 文件不存在，创建一个默认的配置文件
      const defaultConfig = { isTest: false };
      saveConfig(defaultConfig);
      return defaultConfig;
    } else {
      throw error;
    }
  }
}
function saveConfig(config: object) {
  const data = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFilePath, data, 'utf8');
}


const EXT_PATH = is.dev ? 
    path.join(__dirname, '../../src-extension') : 
    path.join(electron.app.getAppPath(), '..', 'app.asar.unpacked', 'src-extension');

// 缓存浏览器对象
var browser: any = null;

/**
 * 获取｜创建小红书浏览器
 * @returns BrowserWindow
 */
const getBrowser = () => {
    if (browser && browser.isEnabled()) return browser;
    const { BrowserWindow } = electron;
    browser = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false,
        autoHideMenuBar: true
    });
    browser.on('close', (event: any) => {
        event.preventDefault();
        // 隐藏窗口而不是关闭
        browser.hide();
    });
    console.log('[xhs-browser] path=>', path.join(__dirname));
    // 调试控制台
    // is.dev && browser.webContents.openDevTools();

    // 加载扩展注入
    browser.webContents.session.loadExtension(EXT_PATH);
    browser.loadURL('https://www.xiaohongshu.com');

    // 监听验证码页面
    browser.webContents.on('did-navigate', (event: any, url: string) => {
        // console.log('did-navigate-in-page:', url);
        // if (url.includes('/web-login/captcha')) {
        if (url && url.includes('/web-login/')) {
            browser.show();
        }
    });
    return browser;
}


/**
 * 向小红书浏览器执行JS代码并获取结果
 * @param code js代码
 * @param tryCount 重试次数
 * @returns 执行结果
 */
const evalJs = async (code: string, tryCount: number = 0) => {
    if (tryCount > 3) return '执行失败！已重试3次！';

    const browser = getBrowser();

    const web_href = await browser.webContents.executeJavaScript('location.href');
    if (web_href && web_href.includes('web-login/captcha')) {
        console.log('验证码界面。请手动过验证码');
        await sleep(3);
        return evalJs(code, tryCount);
    }

    const result = await browser.webContents.executeJavaScript(code);
    // todo: 如果错误了（访问异常） 则自动弹出验证码页面。 同时进行等待循环直到成功（尝试3次）
    if (result && JSON.stringify(result).includes('访问频次异常')) {
        await sleep(2 + tryCount);
        return evalJs(code, tryCount + 1);
    }
    return result;
}

const httpGet = async (url: String) => {
    return await evalJs(`AicuXHSApi.get('${url}');`);
};
const httpPost = async (url: String, data: Object) => {
    return await evalJs(`AicuXHSApi.post('${url}', ${JSON.stringify(data)});`);
}

let SAVE_DATA_PATH: string = '';
const setSaveDataPath = (p: string) => {
    console.log('[set save path]', p);
    SAVE_DATA_PATH = p;
}

// 内测
// TODO: 存储到文件，避免失效
const getJoinedTest = () => {
    // return store.get('isTest');
    const conf = loadConfig();
    return conf.isTest;
}
/**
 * 导出CSV数据
 * @param name 文件名
 * @param data 数据
 * @returns msg
 */
const downloadCsvData = (name: string, data: string) => {
    console.log('[download csv]', name, SAVE_DATA_PATH)
    if (!SAVE_DATA_PATH) return {
        error: '未设置数据存储目录'
    };
    const filePath = path.join(SAVE_DATA_PATH, name.endsWith('.csv') ? name : `${name}.csv`);
    fs.writeFileSync(filePath, data);
    return {
        error: '',
        link: filePath
    };
}

/**
 * 获取当前登陆账号信息｜游客
 * @returns 用户信息
 */
const getUserInfo = async () => {
    const userInfo = await evalJs(`AicuXHSApi.get('/api/sns/web/v2/user/me');`);
    return userInfo;
}

const sleep = async (tm = 1) => new Promise(RES => {
    setTimeout(RES, tm > 1000 ? tm : tm * 1000);
});

// json转换成csv
// ['note_id@id', 'note.title@title']..
const jsonToCsv = (jsonData: Array<any>, fields: Array<string>, arrayDelimiter: string = ";") => {
    // 检查输入数据是否有效
    if (!Array.isArray(jsonData) || !Array.isArray(fields) || fields.length === 0) {
        throw new Error("Invalid input data or fields");
    }

    // 解析字段并提取标题和路径
    const parsedFields = fields.map((field) => {
        const parts = field.split("@");
        if (parts.length === 2) {
            return { header: parts[0], path: parts[1] };
        } else {
            return { header: parts[0], path: parts[0] }; // 没有 @ 符号时，标题和路径相同
        }
    });

    // 生成 CSV 标题
    const csvHeaders = parsedFields.map(field => field.header).join(",");
    let csvContent = csvHeaders + "\n";

    // 遍历 JSON 数据
    jsonData.forEach((item) => {
        // 提取每个字段的值
        const row = parsedFields.map((field) => {
            // 按照点号分割字段路径
            const fieldParts = field.path.split(".");
            let value = item;

            // 逐级访问嵌套字段
            for (const part of fieldParts) {
                if (value && typeof value === "object" && part in value) {
                    value = value[part];
                } else {
                    value = ""; // 如果路径不存在，返回空字符串
                    break;
                }
            }

            // 处理数组类型的数据
            if (Array.isArray(value)) {
                // 将数组元素用指定的分隔符连接成字符串
                value = value.map(v => {
                    // 如果数组中的元素是对象或数组，转换为 JSON 字符串
                    return typeof v === "object" ? JSON.stringify(v) : v;
                }).join(arrayDelimiter);
            }

            // 如果值包含逗号、换行符或双引号，需要用双引号包裹
            if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`; // 替换双引号为两个双引号以符合 CSV 规范
            }
            return value;
        });

        // 将当前行的值拼接为 CSV 格式
        csvContent += row.join(",") + "\n";
    });

    return csvContent;
}


export = { getBrowser, httpGet, httpPost, downloadCsvData, sleep, getUserInfo, setSaveDataPath, jsonToCsv, getJoinedTest };
