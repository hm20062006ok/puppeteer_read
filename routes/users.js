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

async function run(urls, id) {
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
            type = 'ifeng'
            platform = '凤凰网视频'
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
        } else if (arr[i].indexOf('auto-first.cn/news') > -1) {
            type = 'auto_first'
            platform = '汽势'
        } else if (arr[i].indexOf('www.sohu.com') > -1) {
            type = 'sohu'
            platform = '搜狐自媒体'
        } else if (arr[i].indexOf('3g.k.sohu.com') > -1) {
            type = '3g_sohu'
            platform = '搜狐新闻客户端'
        } else if (arr[i].indexOf('yidianzixun.com') > -1) {
            type = 'yidianzixun'
            platform = '一点资讯'
        } else if (arr[i].indexOf('youcheyihou.com') > -1) {
            type = 'youcheyihou'
            platform = '有车以后'
        } else if (arr[i].indexOf('v.qq.com') > -1) {
            type = 'v_qq'
            platform = '腾讯视频'
        } else if (arr[i].indexOf('dripcar.com') > -1) {
            type = 'dripcar'
            platform = '水滴汽车'
        } else if (arr[i].indexOf('myzaker.com') > -1) {
            type = 'myzaker'
            platform = 'Zaker新闻'
        } else if (arr[i].indexOf('laosiji.com') > -1) {
            type = 'laosiji'
            platform = '老司机'
        } else if (arr[i].indexOf('chejiahao.autohome.com.cn') > -1) {
            type = 'chejiahao'
            platform = '汽车之家车家号'
        } else if (arr[i].indexOf('auto.sina.com.cn') > -1) {
            type = 'auto_sina'
            platform = '新浪汽车'
        } else if (arr[i].indexOf('k.sina.cn') > -1) {
            type = 'k_sina'
            platform = '新浪新闻客户端'
        } else if (arr[i].indexOf('new.qq.com') > -1) {
            type = 'new_qq'
            platform = '企鹅号'
        } else if (arr[i].indexOf('video.baomihua.com') > -1) {
            type = 'baomihua'
            platform = '爆米花网视频'
        } else if (arr[i].indexOf('ishare.ifeng.com') > -1) {
            type = 'iShare_ifeng'
            platform = '凤凰新闻客户端视频'
        } else if (arr[i].indexOf('che-shijie.com') > -1) {
            type = 'che_shijie'
            platform = '车视界科技视频'
        } else if (arr[i].indexOf('12365auto.com') > -1) {
            type = 'auto12365'
            platform = '车质网'
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
        fs.writeFile('./data/'+ id + '_data.json', JSON.stringify(values), function () {
            console.log('保存成功')
        })
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
                        data.platform = "爱奇艺视频"
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
                        if (!data.read) {
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
                    case 'auto_first':
                        data.read = jquery('.story-info-seen').text();
                        data.author = jquery('#u_info').children('dd').eq('0').children('h3').eq(0).children('a').eq(0).text()
                        break;
                    case 'sohu':
                        data.read = jquery('.l.read-num').text()
                        data.author = jquery('.name.l').text()
                        data.platform = '搜狐自媒体'
                        data.isVideo = false
                        let id = jquery('#sohuVideoBox').attr('id')
                        if (id) {
                            data.platform = '搜狐自媒体视频'
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
                            data.platform = '有车以后视频'
                        }
                        break;
                    case 'v_qq':
                        data.read = jquery('#mod_cover_playnum').text()
                        data.author = jquery('.user_aside').children('span').eq('0').text()
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
                            data.platform = '老司机视频'
                            data.isVideo = true
                        }
                        break;
                    case 'chejiahao':
                        data.author = jquery('.articleTag').children('span').eq('0').text()
                        data.read = jquery('.articleTag').children('span').eq('1').text()
                        if (jquery('.video-container').length > 0) {
                            data.platform = '汽车之家车家号视频'
                            data.isVideo = true
                        }
                        break;
                    case '3g_sohu':
                        data.author = jquery('.name').children('span').eq('0').text()
                        if (jquery('.multi-videos').length > 0) {
                            data.platform = '搜狐新闻客户端视频'
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
                        data.remark = '可能有错误，需要检查'
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
                        data.author = jquery(".news_date").children('span').eq('3').children('em').eq('0').text().replace('编辑：', '')
                        data.isVideo = true
                        break;
                    case 'auto12365':
                        data.read = jquery(".dy_user").text()
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

router.post('/', function (req, res, next) {
    let urls = JSON.parse(req.body.urls);
    console.log(urls)
    // console.log(data)
    const md5 = crypto.createHash('md5');
    let dataMD5 = md5.update(req.body.urls).digest('hex');
    console.log('dataMD5',dataMD5)
    try {
        const data = fs.readFileSync('./md5.json', 'utf8').split(/[(\r\n)\r\n]+/)
        console.log(data)
        let alreadyInSpam = data.some((item)=>{
            console.log('item',item)
            return item == dataMD5
        })
        if (alreadyInSpam) {
            res.json({msg: '已经在抓取中或已经完成', code: 200, success: false, id: dataMD5})
        }else{
            fs.appendFileSync('./md5.json',  dataMD5+'\n')
            run(urls, dataMD5).then(() => {

            })
            res.json({msg: '开始抓取', code: 200, success: true, id: dataMD5})
        }
        // console.log('alreadyInSpam', alreadyInSpam)
    } catch (err) {
        //TODO 当没有md5.json 文件时的错误处理
        console.error(err)
    }
});


router.get('/query', function (req, res, next) {
    let md5 = req.query.id.trim()
    try {
        if (fs.existsSync('./data/'+ md5 + '_data.json')) {
            const data = fs.readFileSync('./data/'+ md5 + '_data.json', 'utf8')
            res.json({msg: '已完成', code: 200, success: true, id: md5,data: JSON.parse(data)})
        }else{
            res.json({msg: '未完成， 请稍后', code: 200, success: false, id: md5})
        }
    } catch(err) {
        console.error(err)
    }
})

module.exports = router;
