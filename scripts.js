const viewGroupApi = "http://localhost:3000/viewgroup"
const viewsApi = "http://localhost:3000/views"
const classificationApi = "http://localhost:3000/classification"
let listViewGroup;
let listViews;
let listClassification;
let isVie = true;
let filterForm
let quickSearch
let checkBoxes


const covertTimestamp = (timestamp, isTime) => {
    let date = new Date(timestamp * 1000);

    // get date
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let dateString = day + "-" + month + "-" + year;

    // get time
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)

    if (isTime) {
        return formattedTime
    } else {
        return dateString
    }
}


const getClassifyItem = (view) => {
        let classificationIds = view.classification.map(function(classification) {
            return classification.id;
        });
        
        let matchingClassifications = listClassification?.filter(function(classification) {
            return classificationIds.indexOf(classification.id) !== -1;
        });
        
        let classifyNames = matchingClassifications?.map(function(classification) {
            if (isVie) {
                return classification.vieName;
            } else {
                return classification.engName;
            }
        });
        
        let commaSeparatedNames = classifyNames?.join(", ");
        
        return commaSeparatedNames
}


const displayItem = (items) => {
    document.getElementById('root').innerHTML = items?.map((item) => {
        let { thumbnails, vieName, engName, viewGroup, timetaken, classification } = item;
        return (
            `<div class='box'>
                <div class='img-box'>
                    <img class='images' src=${thumbnails}></img>
                </div> 
                <div class='bottom'>
                    <p>${isVie ? vieName : engName}</p>
                    <h2>${covertTimestamp(timetaken, true)}</h2>
                    <h2>${covertTimestamp(timetaken, false)}</h2>
                    <span>${getClassifyItem(item)}</span>
                <button>${
                    isVie ? 
                    listViewGroup.filter((item) => item.id === viewGroup)[0].vieName
                    :
                    listViewGroup.filter((item) => item.id === viewGroup)[0].engName
                }</button>
                </div>
            </div>`
        )
    }).join('')
};


// ------------- fetch API
fetch(viewGroupApi)
    .then((res) => res.json())
    .then((viewGroup) => {
        listViewGroup = [...new Set(viewGroup.map((item) => { return item }))]
        displayItem(listViews)
        // console.log(listViewGroup);
    })

fetch(viewsApi)
    .then((res) => res.json())
    .then((views) => {
        listViews = [...new Set(views.map((item) => { return item }))]
        displayItem(listViews);
        // console.log(listViews);
    })

fetch(classificationApi)
    .then((res) => res.json())
    .then((classification) => {
        listClassification = [...new Set(classification.map((item) => { return item }))]
        displayItem(listViews)
        renderSearchBar()
        // console.log(listClassification);
    })
    .then((e) => {
        updateQuickSearch()
    })



// ------------- change languages
document.getElementById('vie').addEventListener('click', (e) => {
    isVie = true
    displayItem(listViews)
    renderSearchBar()

});


document.getElementById('eng').addEventListener('click', (e) => {
    isVie = false
    displayItem(listViews)
    renderSearchBar()

});


// ------------- import Search
function renderOptions(options, isCheckbox) {
    if (isCheckbox) {
        return options?.map(option => `
           <div class="list-check-box-item">
                <label for="">${isVie? option.vieName : option.engName}</label>
                <input type="checkbox" value="${option.engName}"/>
           </div>
        `).join('');
    } else {
        return options?.map(option => `<option value="${option.engName}">${isVie? option.vieName : option.engName}</option>`).join('');
    }
}

const renderSearchBar = () => {
    document.getElementById('filter-bar').innerHTML = (
        `
        <div class="searchBar">
            <input placeholder="${isVie? "Tìm kiếm nhanh" : "Quick Search"}" id="searchBar" name="searchBar" type="text">
            <i class="fa-solid fa-magnifying-glass glass" id="btn"></i>
        </div>
    
        <form class="filter">
            <div class="item">
                <label for="">${isVie? "Phân loại" : "Category"}</label>
                <div class="list-check-box">${renderOptions(listClassification, true)}</div>

            </div>
            <div class="item">
                <label for="">${isVie? "Nhóm Views" : "View Groups"}</label>
                <select name="viewGroups">
                    <option value="">---</option>
                    ${renderOptions(listViewGroup, false)}
                </select>
            </div>
            <div class="item">
                <label for="">${isVie? "Tên Views" : "View Name"}</label>
                <input type="text" name="viewName">
            </div>
            <div class="item">
                <label for="">${isVie? "Trước" : "Before"}</label>
                <input type="time" id="timeBefore" name="timeBefore">
                <input type="date" id="dateBefore" name="dateBefore">
            </div>
            <div class="item">
                <label for="">${isVie? "Sau" : "After"}</label>
                <input type="time" id="timeAfter" name="timeAfter">
                <input type="date" id="dateAfter" name="dateAfter">
            </div>
            <div class="item submit">
                <button>${isVie? "Lọc" : "Filter"}</button>
                
            </div>
        </form>
        `
    )

    quickSearch = document.getElementById('searchBar')
    filterForm = document.querySelector('.filter')

    quickSearch.addEventListener('keyup', (e) => { 
        // console.log("keyup event fired"); 
        const searchData = e.target.value.toLowerCase(); 
        const filteredData = listViews.filter((item) => { 
          return ( removeAccents(isVie ? item.vieName : item.engName).toLowerCase().includes(searchData) ) 
        }); 
        displayItem(filteredData); 
    });

    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let valueFilter = event.target.elements;

        let timestampBefore = getTimestamp(valueFilter.dateBefore.value, valueFilter.timeBefore.value)
        let timestampAfter = getTimestamp(valueFilter.dateAfter.value, valueFilter.timeAfter.value)

        let checkBoxData = getDataCheckBoxs()
        let filterNewData = listViews.filter(item => {
            
            // check views group
            if(valueFilter.viewGroups.value !== ""){
                if (item.viewGroup !== listViewGroup.filter(gr => gr.engName === valueFilter.viewGroups.value)[0].id) {
                    return false;
                }
            }

            // check categories
            if (checkBoxData) {
                if (!checkBoxData.map(i => i.id).every(elem => item.classification.map(i => i.id).includes(elem))) {
                    return false
                }
            }

            // check name
            if(valueFilter.viewName.value != ''){
                if(!removeAccents(isVie ? item.vieName : item.engName).toLowerCase().includes(valueFilter.viewName.value)){
                    return false;
                }
            }

            // check min date
            if(valueFilter.dateBefore.value !== '' && valueFilter.timeBefore.value !== ''){
                if(item.timetaken > timestampBefore){
                    return false;
                }
            }
            //  check max date
            if(valueFilter.dateAfter.value !== '' && valueFilter.timeAfter.value !== ''){
                if(item.timetaken < timestampAfter){
                    return false;
                }
            }

            return true

        })
        displayItem(filterNewData)
        if (window.innerWidth <= 768) {
            document.querySelector(".data").style.display = "block"
            document.querySelector(".sidebar").style.display = "none"
            document.querySelector("#close-data").style.display = "block"
        }
    })

    checkBoxes = filterForm.querySelectorAll('input[type="checkbox"]');
}


window.addEventListener('DOMContentLoaded', renderSearchBar);



const removeAccents = (str) => {
    var AccentsMap = [
        "aàảãáạăằẳẵắặâầẩẫấậ",
        "dđ",
        "eèẻẽéẹêềểễếệ",
        "iìỉĩíị",
        "oòỏõóọôồổỗốộơờởỡớợ",
        "uùủũúụưừửữứự",
        "yỳỷỹýỵ"
    ];
    
    for (var i=0; i<AccentsMap.length; i++) {
        var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        var char = AccentsMap[i][0];
        str = str.replace(re, char);
    }
    
    return str;
}

function getDataCheckBoxs() { 
    let result = [];
    checkBoxes.forEach(item => { 
        if (item.checked) {  
            let data = {  
                id: listClassification.filter(i => i.engName === item.value)[0].id,
                item: item.value,
                selected: item.checked
            }
            result.push(data); 
        }
    })
    return result
}

const getTimestamp = (date, time) => {
    let exactDate = `${date} ${time}:00`;
    let exactDateTimestamp = new Date(exactDate).getTime();
    let convertTimestamp = exactDateTimestamp/1000
    return convertTimestamp
}

document.querySelector("#clear-search").addEventListener("click", () => {
    displayItem(listViews);
})

document.querySelector("#clear-filter").addEventListener("click", () => {
    filterForm.reset();
})

document.querySelector("#close-data").addEventListener("click", () => {
    displayItem(listViews);
    filterForm.reset();
    document.querySelector(".data").style.display = "none"
    document.querySelector(".sidebar").style.display = "block"
    document.querySelector("#close-data").style.display = "none"

    

})

window.addEventListener("resize", (event) => {
    if (window.innerWidth >= 768) {
        document.querySelector(".sidebar").style.display = "block"
        document.querySelector(".data").style.display = "block"
        document.querySelector("#close-data").style.display = "none"

    } else {
        // document.querySelector(".sidebar").style.display = "block"
        document.querySelector(".data").style.display = "none"
    }

});


