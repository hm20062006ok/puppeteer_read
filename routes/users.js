var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');
const fs = require('fs')

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
        case 'sohu':
            interval = 1000 * 5
            break;
        default:
            interval = 3000
            break;
    }
    return interval
}

function getTimeOutByType(type) {
    let timeout
    switch (type) {
        case 'iqiyi':
            timeout = 1000 * 20
            break;
        default:
            timeout = 1000 * 10
            break;
    }
    return timeout
}

async function run(urls) {
    let arr = [
        'http://www.qctt.cn/video/306288',
        'http://www.qctt.cn/news/1065513',
        // 'http://www.toutiao.com/a1707511721790464/',
        // 'http://www.toutiao.com/a6994081780332495372',
        // 'http://hj.pcauto.com.cn/article/908470',
        // 'http://hj.pcauto.com.cn/article/908188',
        // 'http://www.chexun.com/2021-08-12/113626139.html',
        // 'https://www.360kuai.com/94f2c193405489f8f',
        // 'https://www.iqiyi.com/v_1fwsaf6ira4.html',
        // 'http://www.toutiao.com/a1707672883274759/',
        // 'http://www.toutiao.com/a6994727135298473229/',
        // 'http://aikahao.xcar.com.cn/item/910313.html',
        // 'http://aikahao.xcar.com.cn/item/910054.html',
        // 'http://aikahao.xcar.com.cn/item/909846.html',
        // 'http://aikahao.xcar.com.cn/item/910147.html',
        // 'http://aikahao.xcar.com.cn/item/910945.html',
        // 'http://cheshihao.cheshi.com/news/557752.html',
        // 'http://cheshihao.cheshi.com/news/558130.html',
        // 'http://cheshihao.cheshi.com/news/557548.html',
        // 'http://cheshihao.cheshi.com/video/558485.html',
        // 'http://cheshihao.cheshi.com/news/557887.html',
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
        } else if (arr[i].indexOf('aikahao.xcar.com.cn/video') > -1) {
            type = 'aikahao_video'
            platform = '爱咖号视频'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/news') > -1) {
            type = 'cheshihao'
            platform = '车市号'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/video') > -1) {
            type = 'cheshihao_video'
            platform = '车市号视频'
        } else if (arr[i].indexOf('toutiao.com') > -1) {
            type = 'toutiao'
            platform = '今日头条'
        } else if (arr[i].indexOf('360kuai.com') > -1) {
            type = '360kuai'
            platform = '快资讯'
        } else if (arr[i].indexOf('acfun.cn') > -1) {
            type = 'acfun'
            platform = 'AcFun弹幕视频网'
        } else if (arr[i].indexOf('iqiyi.com') > -1) {
            type = 'iqiyi'
            platform = '爱奇艺视频'
        } else if (arr[i].indexOf('chexun.com') > -1) {
            type = 'chexun'
            platform = '车讯网'
        } else if (arr[i].indexOf('v.ifeng.com') > -1) {
            // TODO  没有例子
            type = 'ifeng'
            platform = '凤凰网'
        } else if (arr[i].indexOf('hj.pcauto.com.cn') > -1) {
            type = 'hj'
            platform = '行家'
        } else if (arr[i].indexOf('hj.pcauto.com.cn') > -1) {
            type = 'hj'
            platform = '行家'
        } else if (arr[i].indexOf('qctt.cn/news') > -1) {
            type = 'qctt'
            platform = '汽车头条'
        } else if (arr[i].indexOf('qctt.cn/video') > -1) {
            type = 'qctt_video'
            platform = '汽车头条视频'
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
    Promise.all(promiseArr).then((values) => {
        console.log('all complete', values)
        // fs.writeFile('./data.json', JSON.stringify(values), function () {
        //     console.log('保存成功')
        // })
    })
}


function getData(browser, record, i) {
    return new Promise(async (resolve, reject) => {
        console.log("getData:", record.url, i, record.id, record.type)
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
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
        })
        await page.goto(record.url, {waitUntil: 'networkidle0', timeout: 30 * 1000}).catch(() => {
            console.log('打开网站时发生错误', record.url)
        })
        // getSelector(record.type)
        await page.waitFor(getTimeOutByType(record.type))
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
                    case 'aikahao_video':
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
                        data.author = jquery('.user__name').text().trim()
                        data.read = jquery('.videoDesc__videoStatics').find('span').first().text().replace(/[^\d.]/g, "")
                        data.platform = '今日头条视频'
                        data.isVideo = true
                        if (!data.author) {
                            data.author = jquery('.desc').find('a').text()
                            data.platform = '今日头条'
                            data.isVideo = false
                        }
                        break;
                    case '360kuai':
                        data.author = jquery('.cp-cp.source.verify.float--left.cp-cp--canclick').text()
                        // data.author = jquery('.name').text().trim()
                        break;
                    case 'acfun':
                        data.read = jquery('.viewsCount').text()
                        data.author = jquery('.up-name').text()
                        break;
                    case 'iqiyi':
                        data.read = jquery('.basic-txt').text().replace(/[^\d.]/g, "");
                        data.author = jquery('.maker-name').text()
                        data.isVideo = true
                        break;
                    case 'chexun':
                        data.read = jquery('#pageViewN').text()
                        data.author = jquery('.em-1').text()
                        break;
                    case 'hj':
                        data.read = jquery('.view').text().replace('浏览：', '');
                        data.author = jquery('.name').text()
                        data.isVideo = false
                        data.platform = '行家'
                        if (!data.read) {
                            data.read = jquery('.view').parent().text()
                            data.author = jquery('.channel').text()
                            data.isVideo = true
                            data.platform = '行家视频'
                        }
                        break;
                    case 'qctt':
                        data.read = jquery('.v-view').parent().text()
                        data.author = jquery('.channel').text()
                        if(!data.read){
                            data.read = jquery('.author-info').children('span').eq(1).text().replace('浏览', '');
                            data.author = jquery('.author-info').find('span').first().text()
                        }
                        data.platform = '汽车头条'
                        break;
                    case 'qctt_video':
                        data.read = jquery('.author-info').children('span').eq(1).text().replace('播放', '');
                        data.author = jquery('.author-info').find('span').first().text()
                        data.platform = '汽车头条视频'
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
            url: record.url,
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

        let headless = true;
        //TODO 其他类型
        if (site.type === 'toutiao' || site.type === 'qctt' || site.type === 'qctt_video') {
            console.log('open with ui')
            headless = false;
        } else {
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
