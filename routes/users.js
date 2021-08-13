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
        default:
            interval = 3000
            break;
    }
    return interval
}

async function run(urls) {
    let arr = [
        'http://aikahao.xcar.com.cn/item/910313.html',
        // 'http://aikahao.xcar.com.cn/item/910054.html',
        // 'http://aikahao.xcar.com.cn/item/909846.html',
        // 'http://aikahao.xcar.com.cn/item/910147.html',
        // 'http://aikahao.xcar.com.cn/item/910945.html',
        // 'http://cheshihao.cheshi.com/news/557752.html',
        // 'http://cheshihao.cheshi.com/news/558130.html',
        'http://cheshihao.cheshi.com/news/557548.html',
        // 'http://cheshihao.cheshi.com/news/557887.html',
        // 'http://cheshihao.cheshi.com/news/558238.html',
        // 'http://cheshihao.cheshi.com/news/557759.html'
    ]
    let arrUrls = []
    for (let i = 0; i < arr.length; i++) {
        let type
        if (arr[i].indexOf('aikahao.xcar.com.cn/item') > -1) {
            type = 'aikahao'
        } else if (arr[i].indexOf('cheshihao.cheshi.com/news') > -1) {
            type = 'cheshihao'
        }
        arrUrls.push({
            type,
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
        promiseArr.push(openNewPage(sites[i],  i))
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
        // console.log('__dirname : ' + __dirname)
        const page = await browser.newPage();
        await page.goto(record.url,{ waitUntil: 'networkidle0', timeout: 30 * 1000 }).catch(() =>{
            console.log('超时')
        })
        // getSelector(record.type)
        // await page.waitFor('.browse_number')
        let title = await page.title();
        await page.addScriptTag({path:'./jquery.js'})
        let result = await page.evaluate(() =>{
            Object.defineProperties(navigator,{
                webdriver:{
                    get: () => false
                }
            })
            var miaoQuery = jQuery.noConflict();
            let read =  miaoQuery('.browse_number').text().replace(/[^\d.]/g, "")
            let author =  miaoQuery('.detail_txt_lf').find('a').text().trim()
            console.log('read:', read)
            console.log('author:', author)
            return {
                read,
                author
            }
        }, '');
        console.log('result', result)

        resolve({
            read:'2',
            author:'1',
            platform: '爱咖号',
            title,
            brand: '别克',
            model: '微蓝6',
            id: record.id
        })
    })
}

function sleeep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function openNewPage(site, index) {
    // console.log("site.type",site.type)
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 1920,
                height: 1080,
            }
        });
        let data = []
        for (let i = 0; i < site.urls.length; i++) {
            let record = await getData(browser, site.urls[i], i)
            console.log(record)
            data.push(record)
            await sleeep(site.interval)
        }
        console.log('第' + index + '个网站:'+site.type +'完成')
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
