var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');
const fs = require('fs')
const crypto = require('crypto');

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
            interval = 1000 * 3
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
            timeout = 1000 * 10
            break;
        case 'acfun':
            timeout = 1000 * 5
            break;
        case 'aikahao_video':
            timeout = 1000 * 5
            break;
        case 'cheshihao_video':
            timeout = 1000 * 5
            break;
        case 'qctt_video':
            timeout = 1000 * 5
            break;
        case 'v_qq':
            timeout = 1000 * 5
            break;
        default:
            timeout = 1000 * 5
            break;
    }
    return timeout
}


async function run(urls, md5) {
    console.log(urls)
    let arr = urls
    // [
    // 'http://www.youcheyihou.com/news/1208235',
    // 'http://www.youcheyihou.com/news/1208407'
    // 'http://www.12365auto.com/zjdy/20210813/152491.shtml'
    // 'http://www.che-shijie.com/news/2108/21556_1.shtml'
    // 'http://ishare.ifeng.com/c/s/v002LJbFVwfWtkOkhVl--uKT941f-_6EFrK476jIS3rcfZpiA__',
    // 'http://v.ifeng.com/c/88eO5V7Aw03',
    // 'http://v.ifeng.com/c/88fpdjRKXOF'
    // 'http://video.baomihua.com/v/48695375'
    // 'http://www.360kuai.com/9ae223b852906ad1d'
    // 'http://v.qq.com/x/page/e3268oxiyqd.html',
    // 'http://new.qq.com/omn/20210810/20210810A0DLQ400'
    // 'http://auto.sina.com.cn/info/cx/2021-08-13/detail-ikqciyzm1187114.shtml',
    // 'http://k.sina.cn/article_6569466249_18792198900101bm46.html'
    // 'http://3g.k.sohu.com/t/n549568301',
    // 'http://3g.k.sohu.com/t/n549602634'
    // 'http://chejiahao.autohome.com.cn/info/9286866',
    // 'http://chejiahao.autohome.com.cn/info/9288959'
    // 'https://www.laosiji.com/thread_1511187/',
    // 'https://www.laosiji.com/thread_1511227/'
    // 'http://www.myzaker.com/article/610f02837f780beb4c000002'
    // 'http://www.dripcar.com/zixun/172122.html'
    // 'https://v.qq.com/x/page/e3268neaty4.html'
    // 'http://www.youcheyihou.com/news/1208232',
    // 'http://www.youcheyihou.com/news/1208326'
    // 'http://www.yidianzixun.com/article/0WhsmCa4',
    // 'http://www.sohu.com/a/483197234_121119176',
    // 'http://www.sohu.com/a/483117242_121189651',
    // 'http://www.auto-first.cn/news/story_104551.html',
    // 'http://www.auto-first.cn/news/story_104608.html',
    // 'http://www.qctt.cn/video/306288',
    // 'http://www.qctt.cn/news/1065513',
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
    // ]
    let arrUrls = []
    for (let i = 0; i < arr.length; i++) {
        let type = '';
        let platform = '';
        if (arr[i].indexOf('aikahao.xcar.com.cn/item') > -1) {
            type = 'aikahao'
            platform = '?????????'
        } else if (arr[i].indexOf('aikahao.xcar.com.cn/video') > -1) {
            type = 'aikahao_video'
            platform = '???????????????'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/news') > -1) {
            type = 'cheshihao'
            platform = '?????????'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/video') > -1) {
            type = 'cheshihao_video'
            platform = '???????????????'
        } else if (arr[i].indexOf('toutiao.com') > -1) {
            type = 'toutiao'
            platform = '????????????'
        } else if (arr[i].indexOf('360kuai.com') > -1) {
            type = '360kuai'
            platform = '?????????'
        } else if (arr[i].indexOf('acfun.cn') > -1) {
            type = 'acfun'
            platform = 'AcFun???????????????'
        } else if (arr[i].indexOf('iqiyi.com') > -1) {
            type = 'iqiyi'
            platform = '???????????????'
        } else if (arr[i].indexOf('chexun.com') > -1) {
            type = 'chexun'
            platform = '?????????'
        } else if (arr[i].indexOf('v.ifeng.com') > -1) {
            type = 'ifeng'
            platform = '???????????????'
        } else if (arr[i].indexOf('hj.pcauto.com.cn') > -1) {
            type = 'hj'
            platform = '??????'
        } else if (arr[i].indexOf('hj.pcauto.com.cn') > -1) {
            type = 'hj'
            platform = '??????'
        } else if (arr[i].indexOf('qctt.cn/news') > -1) {
            type = 'qctt'
            platform = '????????????'
        } else if (arr[i].indexOf('qctt.cn/video') > -1) {
            type = 'qctt_video'
            platform = '??????????????????'
        } else if (arr[i].indexOf('auto-first.cn/news') > -1) {
            type = 'auto_first'
            platform = '??????'
        } else if (arr[i].indexOf('www.sohu.com') > -1) {
            type = 'sohu'
            platform = '???????????????'
        } else if (arr[i].indexOf('3g.k.sohu.com') > -1) {
            type = '3g_sohu'
            platform = '?????????????????????'
        } else if (arr[i].indexOf('yidianzixun.com') > -1) {
            type = 'yidianzixun'
            platform = '????????????'
        } else if (arr[i].indexOf('youcheyihou.com') > -1) {
            type = 'youcheyihou'
            platform = '????????????'
        } else if (arr[i].indexOf('v.qq.com') > -1) {
            type = 'v_qq'
            platform = '????????????'
        } else if (arr[i].indexOf('dripcar.com') > -1) {
            type = 'dripcar'
            platform = '????????????'
        } else if (arr[i].indexOf('myzaker.com') > -1) {
            type = 'myzaker'
            platform = 'Zaker??????'
        } else if (arr[i].indexOf('laosiji.com') > -1) {
            type = 'laosiji'
            platform = '?????????'
        } else if (arr[i].indexOf('chejiahao.autohome.com.cn') > -1) {
            type = 'chejiahao'
            platform = '?????????????????????'
        } else if (arr[i].indexOf('auto.sina.com.cn') > -1) {
            type = 'auto_sina'
            platform = '????????????'
        } else if (arr[i].indexOf('k.sina.cn') > -1) {
            type = 'k_sina'
            platform = '?????????????????????'
        } else if (arr[i].indexOf('new.qq.com') > -1) {
            type = 'new_qq'
            platform = '?????????'
        } else if (arr[i].indexOf('video.baomihua.com') > -1) {
            type = 'baomihua'
            platform = '??????????????????'
        } else if (arr[i].indexOf('ishare.ifeng.com') > -1) {
            type = 'iShare_ifeng'
            platform = '???????????????????????????'
        } else if (arr[i].indexOf('che-shijie.com') > -1) {
            type = 'che_shijie'
            platform = '?????????????????????'
        } else if (arr[i].indexOf('12365auto.com') > -1) {
            type = 'auto12365'
            platform = '?????????'
        } else if (arr[i].indexOf('inews.qq.com') > -1) {
            type = 'news_qq'
            platform = '???????????????????????????'
        }
        arrUrls.push({
            type,
            platform,
            url: arr[i],
            id: i + 1
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
        promiseArr.push(openNewPage(sites[i], i, md5))
        // console.log('promiseArr.push' + i)
    }
    Promise.all(promiseArr).then((values) => {
        console.log('all complete', values)
        // fs.writeFile('./data/'+ md5 + '_data.json', JSON.stringify(values), function () {
        //     console.log('????????????')
        // })
    })
}


function getData(browser, record, i) {
    return new Promise(async (resolve, reject) => {
        console.log("getData:", record.url, i, record.id, record.type)
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
            const newProto = navigator.__proto__;
            delete newProto.webdriver;
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
            Object.defineProperty(navigator, 'userAgent', {  //userAgent?????????????????????headless????????????????????????
                get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
            });
            Object.defineProperty(navigator, 'plugins', {  //???????????????????????????
                get: () => [{
                    "description": "Portable Document Format",
                    "filename": "internal-pdf-viewer",
                    "length": 1,
                    "name": "Chrome PDF Plugin"
                }]
            });
            Object.defineProperty(navigator, 'languages', { //????????????
                get: () => ["zh-CN", "zh", "en"],
            });
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({state: Notification.permission}) :
                    originalQuery(parameters)
            );
        })
        // await page.goto(record.url, {waitUntil: 'networkidle0', timeout: 30 * 1000}).catch(() => {
        await page.goto(record.url, {waitUntil: 'load', timeout: 10 * 1000}).catch(() => {
            console.log('???????????????????????????', record.url)
        })
        console.log(Date.now())
        await page.waitFor(getTimeOutByType(record.type))
        console.log(Date.now())

        // await page.waitForSelector(getSelectorByType(record.type)).catch(() => {
        //     console.log('???????????????????????????', record.url)
        // })
        let title = await page.title();
        await page.addScriptTag({path: './jquery.js'})
        let result = await page.evaluate((type) => {

            function findDataByType(jquery, type) {
                let data = {}
                switch (type) {
                    case 'aikahao':
                        data.read = jquery('.browse_number').text().replace('??????', "")
                        data.author = jquery('.detail_txt_lf').find('a').text().trim()
                        break;
                    case 'aikahao_video':
                        data.read = jquery('.browse_number').text().replace('??????', "")
                        data.author = jquery('.detail_txt_lf').find('a').text().trim()
                        break;
                    case 'cheshihao':
                        data.read = jquery('.icon_browse').parent().text().replace(/[^\d.]/g, "")
                        data.author = jquery('.author_txt').children('p').eq(0).children('a').eq(0).text().trim()
                        break;
                    case 'cheshihao_video':
                        data.read = jquery('.icon_browse').parent().text().replace(/[^\d.]/g, "")
                        data.author = jquery('.author_txt').children('p').eq(0).children('a').eq(0).text().trim()
                        break;
                    case 'toutiao':
                        data.author = jquery('.user__name').text().trim()
                        data.read = jquery('.videoDesc__videoStatics').find('span').first().text().replace(/[^\d.]/g, "")
                        data.platform = '??????????????????'
                        data.isVideo = true
                        if (!data.author) {
                            data.author = jquery('.desc').find('a').text()
                            data.platform = '????????????'
                            data.isVideo = false
                        }
                        break;
                    case '360kuai':
                        data.author = jquery('.float--left.cp-cp--canclick').text()
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
                        data.platform = "???????????????"
                        break;
                    case 'chexun':
                        data.read = jquery('#pageViewN').text()
                        data.author = jquery('.em-1').text()
                        break;
                    case 'hj':
                        data.read = jquery('.view').text().replace('?????????', '');
                        data.author = jquery('.name').text()
                        data.isVideo = false
                        data.platform = '??????'
                        if (!data.read) {
                            data.read = jquery('.view').parent().text()
                            data.author = jquery('.channel').text()
                            data.isVideo = true
                            data.platform = '????????????'
                        }
                        break;
                    case 'qctt':
                        data.read = jquery('.v-view').parent().text()
                        data.author = jquery('.channel').text()
                        if (!data.read) {
                            data.read = jquery('.author-info').children('span').eq(1).text().replace('??????', '');
                            data.author = jquery('.author-info').find('span').first().text()
                        }
                        data.platform = '????????????'
                        break;
                    case 'qctt_video':
                        data.read = jquery('.author-info').children('span').eq(1).text().replace('??????', '');
                        data.author = jquery('.author-info').find('span').first().text()
                        data.platform = '??????????????????'
                        break;
                    case 'auto_first':
                        data.read = jquery('.story-info-seen').text();
                        data.author = jquery('#u_info').children('dd').eq('0').children('h3').eq(0).children('a').eq(0).text()
                        break;
                    case 'sohu':
                        data.read = jquery('.l.read-num').text().replace('??????(', '').replace(')', '')
                        if (!data.read) {
                            data.read = jquery('.read-num').text().replace('?????? (', '').replace(')', '')
                        }
                        data.author = jquery('.right-author-info').children('div').eq(0).children('a').eq(1).text()

                        if (!data.author) {
                            data.author = jquery('#user-info').children('h4').eq(0).text().trim()
                        }

                        if (!data.author) {
                            data.author = jquery('.author-box').children('.name').eq(0).text().trim()
                        }

                        data.platform = '???????????????'
                        data.isVideo = false
                        let id = jquery('#sohuVideoBox').attr('id')
                        if (id) {
                            data.platform = '?????????????????????'
                            data.isVideo = true
                        }
                        if (jquery('#mainVideoContent').attr('id')) {
                            data.platform = '?????????????????????'
                            data.isVideo = true
                        }

                        break;
                    case 'yidianzixun':
                        // data.read = jquery('.l.read-num').text()
                        data.author = jquery('.yidian-info').children('span').eq('0').text()
                        break;
                    case 'youcheyihou':
                        data.author = jquery('.news-detail__summary').children('span').eq('0').text()
                        if (jquery('.news-video').length > 0) {
                            data.isVideo = true
                            data.platform = '??????????????????'
                        }
                        break;
                    case 'v_qq':
                        data.read = jquery('#mod_cover_playnum').text()
                        data.author = jquery('.user_aside').children('span').eq('0').text()
                        if (!data.author || data.author == 'undefined') {
                            data.author = ''
                        }
                        data.isVideo = true
                        break;
                    case 'dripcar':
                        data.read = jquery('.middle').children('span').eq('0').text()
                        data.author = jquery('.time').text().split('|')[0].trim()
                        break;
                    case 'myzaker':
                        data.author = jquery('.article-auther').text()
                        break;
                    case 'laosiji':
                        data.author = jquery('.author-name').children('span').eq('0').text()
                        if (jquery('.player').length > 0) {
                            data.platform = '???????????????'
                            data.isVideo = true
                        }
                        break;
                    case 'chejiahao':
                        data.author = jquery('.articleTag').children('span').eq('0').text()
                        data.read = jquery('.articleTag').children('span').eq('1').text().replace('??????', '')
                        if (jquery('.video-container').length > 0) {
                            data.platform = '???????????????????????????'
                            data.isVideo = true
                        }
                        break;
                    case '3g_sohu':
                        data.author = jquery('.name').children('span').eq('0').text()
                        if (jquery('.multi-videos').length > 0) {
                            data.platform = '???????????????????????????'
                            data.isVideo = true
                        }
                        break;
                    case 'auto_sina':
                        data.author = jquery('.source.ent-source').text()
                        break;
                    case 'k_sina':
                        data.author = jquery('.weibo_user').text()
                        break;
                    case 'new_qq':
                        data.author = jquery('.author').children('div').eq('0').text()
                        break;
                    case 'baomihua':
                        data.author = jquery('.user_name').children('a').eq('0').text()
                        data.isVideo = true
                        data.remark = '??????????????????????????????'
                        break;
                    case 'ifeng':
                        data.author = jquery("div[class^='userName']").children('a').eq('0').text()
                        data.read = jquery("span[class^='playNum']").text()
                        data.isVideo = true
                        break;
                    case 'iShare_ifeng':
                        data.author = jquery("p[class^='sourceFrom']").text()
                        data.isVideo = true
                        break;
                    case 'che_shijie':
                        data.read = jquery(".news_date").children('span').eq('2').children('i').eq('0').text()
                        data.author = jquery(".news_date").children('span').eq('3').children('em').eq('0').text().replace('?????????', '')
                        data.isVideo = true
                        break;
                    case 'auto12365':
                        data.read = jquery(".dy_user").text()
                        break;
                    case 'news_qq':
                        data.author = jquery("._5utH1zATwzI7m6_Bho33a").text()
                        data.isVideo = true
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

async function openNewPage(site, index, md5) {
    console.log("site.type", site.type)
    return new Promise(async (resolve, reject) => {

        let headless = true;
        let headlessSites = ['toutiao', 'qctt', 'qctt_video']
        if (headlessSites.includes(site.type)) {
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
        // let data = []

        for (let i = 0; i < site.urls.length; i++) {
            let record = await getData(browser, site.urls[i], i)

            if (!fs.existsSync('./data/' + md5 + '_data.json')) {
                console.log('??????')
                fs.writeFileSync('./data/' + md5 + '_data.json', JSON.stringify(record))
            } else {
                console.log('??????')
                fs.appendFileSync('./data/' + md5 + '_data.json', ',' + JSON.stringify(record))
            }
            console.log(record)
            let fileString = fs.readFileSync('./md5.json', 'utf8');
            let regExp = new RegExp('(?<=' + md5 + '","completed":).+(?=,)');
            let count = Number.parseInt(fileString.match(regExp)[0]) + 1
            let replacedString = fileString.replace(regExp, count + '')
            console.log('count', replacedString)
            fs.writeFileSync('./md5.json', replacedString)

            // data.push(record)
            await sleeep(site.interval)
        }
        console.log('???' + index + '?????????:' + site.type + '??????' + md5)

        await browser.close();
        resolve(index)
    })

}

router.post('/', function (req, res, next) {

    process.setMaxListeners(0)
    let urls = JSON.parse(req.body.urls);
    console.log(urls)
    // console.log(data)
    const md5 = crypto.createHash('md5');
    let dataMD5 = md5.update(req.body.urls).digest('hex');
    console.log('dataMD5', dataMD5)
    let requestData = {
        id: dataMD5,
        completed: 0,
        length: urls.length,
    }
    try {

        if (!fs.existsSync('./md5.json')) {
            fs.writeFileSync('./md5.json', JSON.stringify(requestData))
            run(urls, dataMD5).then(() => {

            })
            res.json({msg: '????????????...', code: 200, success: true, id: dataMD5})
        } else {
            const data = JSON.parse('[' + fs.readFileSync('./md5.json', 'utf8') + ']')
            console.log(data)
            let alreadyInSpam = data.some((item) => {
                return item.id === dataMD5
            })
            if (alreadyInSpam) {
                res.json({msg: '??????????????????????????????', code: 200, success: false, id: dataMD5})
            } else {
                fs.appendFileSync('./md5.json', ',' + JSON.stringify(requestData))
                run(urls, dataMD5).then(() => {

                })
                res.json({msg: '????????????...', code: 200, success: true, id: dataMD5})
            }
        }
    } catch (err) {
        console.error(err)
    }
});


router.get('/query', function (req, res, next) {
    res.header('Content-Type', 'application/json');
    let md5 = req.query.id.trim()
    try {

        const data = JSON.parse('[' + fs.readFileSync('./md5.json', 'utf8') + ']')
        let currentRequest = {}
        let alreadyInSpam = data.some((item) => {
            if (item.id === md5) {
                currentRequest = item
            }
            return item.id === md5
        })
        if (alreadyInSpam) {
            if (fs.existsSync('./data/' + md5 + '_data.json')) {
                const data = '[' + fs.readFileSync('./data/' + md5 + '_data.json', 'utf8') + ']'
                if (currentRequest.completed === currentRequest.length) {
                    res.json({
                        msg: '?????????',
                        code: 200,
                        success: true,
                        id: md5,
                        completed: currentRequest.completed,
                        total: currentRequest.length,
                        data: JSON.parse(data)
                    })
                    return
                }
                res.json({
                    msg: '???????????????',
                    code: 201,
                    success: false,
                    id: md5,
                    completed: currentRequest.completed,
                    total: currentRequest.length,
                    data: JSON.parse(data)
                })
                return
            } else {
                res.json({msg: '???????????? ?????????', code: 400, success: false, id: md5})
                return
            }
        } else {
            res.json({msg: '???????????? ?????????', code: 400, success: false, id: md5})
            return
        }


    } catch (err) {
        console.error(err)
    }
})

module.exports = router;
