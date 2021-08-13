var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

/* GET users listing. */

function getInterval(type) {
    let interval
    switch (type) {
        case 'aikahao':
            interval = 3000
            break;
        case 'cheshihao':
            interval = 3000
            break;
        case 'cheshihao_video':
            interval = 3000
            break;
        default:
            interval = 3000
            break;
    }
    return interval
}

async function run(urls) {
    let arr = [
        'http://www.toutiao.com/a1707672883274759/',
        'http://www.toutiao.com/a6994727135298473229/',
        // 'http://aikahao.xcar.com.cn/item/910313.html',
        // 'http://aikahao.xcar.com.cn/item/910054.html',
        // 'http://aikahao.xcar.com.cn/item/909846.html',
        // 'http://aikahao.xcar.com.cn/item/910147.html',
        // 'http://aikahao.xcar.com.cn/item/910945.html',
        // 'http://cheshihao.cheshi.com/news/557752.html',
        // 'http://cheshihao.cheshi.com/news/558130.html',
        // 'http://cheshihao.cheshi.com/news/557548.html',
        'http://cheshihao.cheshi.com/video/558485.html',
        'http://cheshihao.cheshi.com/news/557887.html',
        // 'http://cheshihao.cheshi.com/news/558238.html',
        // 'http://cheshihao.cheshi.com/news/557759.html'
    ]
    let arrUrls = []
    for (let i = 0; i < arr.length; i++) {
        let type = '';
        let platform = '';
        if (arr[i].indexOf('aikahao.xcar.com.cn/item') > -1) {
            type = 'aikahao'
            platform = '爱咖号'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/news') > -1) {
            type = 'cheshihao'
            platform = '车市号'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/video') > -1) {
            type = 'cheshihao_video'
            platform = '车市号视频'
        } else if (arr[i].indexOf('toutiao.com') > -1) {
            type = 'toutiao'
            platform = '今日头条'
        }
        arrUrls.push({
            type,
            platform,
            url: arr[i],
            id: i
        })
    }

    function unique(arr) {
        const res = new Map()
        return arr.filter((a) => !res.has(a) && res.set(a, 1))
    }

    function group(arr, k) {
        let allGroupName = arr.map(item => {
            return item[k]
        })
        let typeList = unique(
            allGroupName
        );
        let list = []
        typeList.forEach(ele => {
            let obj = {};
            obj.urls = [];
            obj.urls = arr.filter(sell => ele === sell[k])
            obj.type = ele
            obj.interval = getInterval(obj.type)
            list.push(obj)
        })
        return list
    }

    let sites = group(arrUrls, 'type')

    let promiseArr = []
    for (let i = 0; i < sites.length; i++) {
        // console.log("sites[i]",sites[i])
        promiseArr.push(openNewPage(sites[i], i))
        // console.log('promiseArr.push' + i)
    }
    Promise.all(promiseArr).then(() => {
        console.log('all complete')
    })
}

// let json = []
// for (let i = 0; i < emojis.length; i++) {
//     const name = emojis[i].slice(emojis[i].lastIndexOf('/') + 1)
//     // 将emoji写入本地文件中
//     request(emojis[i]).pipe(fs.createWriteStream('./' + (i < 10 ? '0' + i : i) + name))
//     json.push({
//         name,
//         url: `./a/a/${name}` // 你的url地址
//     })
//     console.log(`${name}----emoji写入成功`)
// }
// // 写入json文件
// fs.writeFile('./google-emoji.json', JSON.stringify(json), function () {})


function getData(browser, record, i) {
    return new Promise(async (resolve, reject) => {
        console.log("getData:", record.url, i, record.id, record.type)
        const page = await browser.newPage();
        let webdirver = await page.evaluateOnNewDocument(() => {
            const newProto = navigator.__proto__;
            // delete newProto.webdriver;
            navigator.__proto__ = newProto;
            window.chrome = {};
            window.chrome.app = {
                "InstallState": "hehe",
                "RunningState": "haha",
                "getDetails": "xixi",
                "getIsInstalled": "ohno"
            };
            window.chrome.csi = function () {
            };
            window.chrome.loadTimes = function () {
            };
            window.chrome.runtime = function () {
            };
            Object.defineProperty(navigator, 'userAgent', {  //userAgent在无头模式下有headless字样，所以需覆写
                get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
            });
            Object.defineProperty(navigator, 'plugins', {  //伪装真实的插件信息
                get: () => [{
                    "description": "Portable Document Format",
                    "filename": "internal-pdf-viewer",
                    "length": 1,
                    "name": "Chrome PDF Plugin"
                }]
            });
            Object.defineProperty(navigator, 'languages', { //添加语言
                get: () => ["zh-CN", "zh", "en"],
            });
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({state: Notification.permission}) :
                    originalQuery(parameters)
            );
            let count = 0
            return "1"
        })
        webdirver.then((payload) => {
            console.log("payload",payload)
        })
        console.log('webdirver', )
        await page.goto(record.url, {waitUntil: 'networkidle0', timeout: 30 * 1000}).catch(() => {
            console.log('超时')
        })
        // getSelector(record.type)
        await page.waitFor(5000)
        let title = await page.title();
        await page.addScriptTag({path: './jquery.js'})
        let result = await page.evaluate((type) => {

            function findDataByType(jquery, type) {
                let data = {}
                switch (type) {
                    case 'aikahao':
                        data.read = jquery('.browse_number').text().replace(/[^\d.]/g, "")
                        data.author = jquery('.detail_txt_lf').find('a').text().trim()
                        break;
                    case 'cheshihao':
                        data.read = jquery('.icon_browse').parent().text().replace(/[^\d.]/g, "")
                        data.author = jquery('.name').text().trim()
                        break;
                    case 'cheshihao_video':
                        data.read = jquery('.icon_browse').parent().text().replace(/[^\d.]/g, "")
                        data.author = jquery('.name').text().trim()
                        break;
                    case 'toutiao':
                        // console.log('length:', )jquery('.playerContainer').length
                        // if(jquery('.playerContainer').length > 0){
                        //     data.platform = '今日头条视频'
                        //     data.isVideo = true
                        // }else{
                        //     data.platform = '今日头条'
                        //     data.isVideo = false
                        // }
                        data.author = jquery('.user__name').text().trim()
                        if (!data.author) {
                            data.author = jquery('.name').text().trim()
                        }
                        // data.read = jquery('.icon_browse').parent().text().replace(/[^\d.]/g, "")
                        break;
                    default:
                        break;
                }
                return data
            }

            let miaoQuery = jQuery.noConflict();
            return findDataByType(miaoQuery, type)
        }, record.type);

        // console.log('result', )
        resolve(Object.assign({
            read: '',
            author: '',
            platform: record.platform,
            title,
            brand: '',
            model: '',
            isVideo: record.type.indexOf('_video') > -1,
            id: record.id,
            remark: ''
        }, result))
    })
}

function sleeep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function openNewPage(site, index) {
    // console.log("site.type",site.type)
    return new Promise(async (resolve, reject) => {

        let headless = false;
        if(site.type === 'toutiao'){
            headless = false;
        }else{
            headless = true;
        }
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
            ignoreDefaultArgs: ["--enable-automation"],
            headless
        });
        let data = []
        for (let i = 0; i < site.urls.length; i++) {
            let record = await getData(browser, site.urls[i], i)
            console.log(record)
            data.push(record)
            await sleeep(site.interval)
        }
        console.log('第' + index + '个网站:' + site.type + '完成')
        await browser.close();
        resolve(data)
    })

}

// 标题 平台 作者 浏览数 视频/文章  车型  品牌

router.get('/', function (req, res, next) {
    // screenShot().then(() => {
    //     res.send('respond with a resource');
    //
    // })
    run().then(() => {
        res.send('respond with a resource');
    })
});

module.exports = router;
