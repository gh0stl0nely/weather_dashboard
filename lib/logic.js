/* Functionality:
1) Write name of city into input (id="search-bar") and press id="search-icon" will create an option,
, give it a id == valueOfInput, append into id="city-list" and save the array of value into local Storage called "searched_city"

** Caveat: If list exist in local storage, Make sure to displayContentFromLocalStorage
- For future, get STATUS + Main temp, High, low, precip, wind
*/

var icon = {
    Rain: 'fas fa-cloud-showers-heavy',
    Thunderstorm: 'fas fa-bolt',
    Clouds: 'fas fa-cloud',
    Drizzle: 'fas fa-cloud-rain',
    Snow: 'fas fa-snowflake',
    Clear: 'fas fa-sun',
}
var searched_city_list = JSON.parse(localStorage.getItem('searched_city'));
var selected = localStorage.getItem('last_searched'); // If searched
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var runTimerIfLastSearchExist = null; //Always null first   

//Main Script to run
$(document).ready(function () {
    displayContentFromLocalStorage();
    var timeChecker = setInterval(updateTimeAndDate, 1000);
    var dayChecker = setInterval(checkOneDayPassed, 1000); // At the end of day, resend Ajax requests
    var uvChecker = setInterval(checkNoonTime, 1000); // UV index is changed at 12:15PM, so we send another 
    // Search function 
    $('#search-icon').on('click', function () {
        var user_input = validateAndReturnProperUserInput();
        /// Validate input first! // Once passed this we are good to call Ajax
        requestAjaxData(user_input);
        requestAjaxDataFuture(user_input);
        requestAjaxDataForGeolocation(user_input);
    })
    // Search-history function 
    $('select').on('change', function () {
        $('#today-location').text(this.value);
        localStorage.setItem('last_searched', this.value);
        resendAjaxRequest();
    })
})

// Javascript Function and Ajax request function
function displayContentFromLocalStorage() {
    // Display search history upon refresh 
    var current = new Date();
    $('#local-date').text(current.toLocaleDateString());
    $('#local-time').text("Local time: " + current.toLocaleTimeString());
    
    updateTimeAndDate(); 

    var searched_city_list = JSON.parse(localStorage.getItem('searched_city'));

    if (!searched_city_list) {
        document.getElementById('weather-section').style.display = 'none';
        return;
    } else {
        for (var i = 0; i < searched_city_list.length; i++) {
            var option = document.createElement('option');
            option.id = searched_city_list[i];
            option.innerHTML = searched_city_list[i];
            $('#city-list').append(option);
        }
    }

    // Upon refresh, make sure the current city is the last selected one
    $('#today-location').text(selected);
    $('select').val(selected);

    if (localStorage.getItem('last_searched')) {
        resendAjaxRequest();
    }

}

function requestAjaxData(user_input) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (this.status == 200 && this.readyState == 4) {

            var res = JSON.parse(this.responseText);
            updateTodayInfo(res);

            var option = document.createElement('option');
            option.id = user_input;
            option.innerHTML = user_input;
            // toronto // // taipei
            if (!searched_city_list) {
                searched_city_list = [];
                searched_city_list.push(user_input);
                $('#city-list').append(option);
                $('#today-location').text(user_input);
                localStorage.setItem('searched_city', JSON.stringify(searched_city_list));
            } else {
                // If list does not contain the value, then push it in
                if (!searched_city_list.includes(user_input)) {
                    searched_city_list.push(user_input);
                    $('#city-list').append(option);
                    $('#today-location').text(user_input);
                    localStorage.setItem('searched_city', JSON.stringify(searched_city_list));
                }
            }
            //Saved in local storage
            $('#today-location').text(user_input);
            localStorage.setItem('last_searched', user_input);

            // Now we set another timer here so that we make sure last_searched is actually last
            clearInterval(runTimerIfLastSearchExist); // We need to make sure before calling another Ajax,
            runTimerIfLastSearchExist = setInterval(resendAjaxRequest, 300000); // Send a new request for new Content
        }
    }

    request.open('GET', "https://api.openweathermap.org/data/2.5/weather?q=" + user_input + "&APPID=4b4e4f9a1cadefa9b3b5de461a5ea118", true);
    request.send();
}

function requestAjaxDataFuture(user_input) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.status == 200 && this.readyState == 4) {

            var res = JSON.parse(this.responseText);
            var list = res.list; // LIst of future array 
            // console.log(list);

            var current = new Date();
            var cur_year = current.getFullYear();
            var raw_month = current.getMonth() + 1; // Cuz start with 0
            var cur_month = raw_month <= 9 ? '0' + raw_month : raw_month;
            var cur_date = current.getDate() <= 9 ? '0' + current.getDate() : current.getDate();
            var final_current_date = cur_year + '-' + cur_month + '-' + cur_date;

            var cur_hour = current.getHours() <= 9 ? '0' + current.getHours() : current.getHours();
            var futureDate;
            var futureHour;
            var counter = 0;

            // We can only start loop if cur < future , then we can do like if cur hour < futureHour
            for (var i = 0; i < list.length; i++) {
                if (counter == 5) {
                    break;
                } // Exit loop after if the counter is five (since all five days are filled)
                futureDate = list[i]['dt_txt'].slice(0, 10); // for [i] in list

                if (final_current_date >= futureDate) {
                    continue; // Skip if final date is larger or equal 
                }

                // If final current date < futureDate means we are at correct
                futureHour = list[i]['dt_txt'].slice(11, 13);

                if (cur_hour >= 21) {
                    cur_hour = 21;
                    // If future == afterFuture (meaning they are the same date)
                    // then continue; if future < afterFuture, then start loop 
                    var day_block = document.getElementById('forecast');
                    var child = day_block.children[counter];

                    var item = list[i];

                    var celcius = Math.floor(Number(item.main.temp) - 273.15) + '°C';
                    var celcius_high = Math.floor(Number(item.main.temp_max) - 273.15) + '°C';
                    var celcius_low = Math.floor(Number(item.main.temp_min) - 273.15) + '°C';
                    var wind = Math.round(((Number(item.wind.speed) * 2.237)) * 10) / 10 + ' MPH'

                    updateIconFuture(child, item.weather[0].main);
                    //Assignment
                    child.children[3].innerHTML = list[i].weather[0].main;
                    child.children[4].innerHTML = celcius;
                    child.children[5].innerHTML = 'High: ' + celcius_high;
                    child.children[6].innerHTML = 'Low: ' + celcius_low;
                    child.children[7].innerHTML = 'Wind: ' + wind;
                    counter++;
                    final_current_date = futureDate;

                } else if (cur_hour <= futureHour) {

                    var day_block = document.getElementById('forecast');
                    var child = day_block.children[counter];

                    var item = list[i];

                    var celcius = Math.floor(Number(item.main.temp) - 273.15) + '°C';
                    var celcius_high = Math.floor(Number(item.main.temp_max) - 273.15) + '°C';
                    var celcius_low = Math.floor(Number(item.main.temp_min) - 273.15) + '°C';
                    var wind = Math.round(((Number(item.wind.speed) * 2.237)) * 10) / 10 + ' MPH'

                    updateIconFuture(child, item.weather[0].main);

                    //Assignment
                    child.children[3].innerHTML = list[i].weather[0].main;
                    child.children[4].innerHTML = celcius;
                    child.children[5].innerHTML = 'High: ' + celcius_high;
                    child.children[6].innerHTML = 'Low: ' + celcius_low;
                    child.children[7].innerHTML = 'Wind: ' + wind;
                    counter++;
                    final_current_date = futureDate;
                }
            }
        }
    }
    request.open('GET', "https://api.openweathermap.org/data/2.5/forecast?q=" + user_input + "&APPID=4b4e4f9a1cadefa9b3b5de461a5ea118", true);
    request.send();
}

function requestAjaxDataForGeolocation(user_input) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.status == 200 && request.readyState == 4) {
            var res = JSON.parse(this.responseText);
            console.log(res);
            localStorage.setItem('lat', res.latt);
            localStorage.setItem('lon', res.longt);
            // Got latitude and longtitude
            // var lat = res.latt;
            // var lon = res.lon;
            var callback = setTimeout(requestAjaxDataForUVIndex, 500);
        }
    }
    request.open('GET', "https://geocode.xyz/?locate=" + user_input + "&geoit=JSON", true);
    request.send();
}

//2nd Ajax call after requestAjaxDataFor Geolocation is done
function requestAjaxDataForUVIndex() {
    var request = new XMLHttpRequest();
    var lat = localStorage.getItem('lat');
    var lon = localStorage.getItem('lon');

    request.onreadystatechange = function () {
        if (request.status == 200 && request.readyState == 4) {
            var res = JSON.parse(this.responseText);
            var uv_index = res.value;
            var uv_block = document.getElementById('UV');
    
            if (uv_index < 3) {
                uv_block.style.backgroundColor = 'green';
            } else if (uv_index >= 3 && uv_index < 6) {
                uv_block.style.backgroundColor = 'yellow';
            } else if (uv_index >= 6 && uv_index < 8) {
                uv_block.style.backgroundColor = 'orange';
            } else if (uv_index >= 8) {
                uv_block.style.backgroundColor = 'red';
            }

            document.getElementById('UV').innerHTML = res.value;
        }
    }

    request.open('GET', "https://api.openweathermap.org/data/2.5/uvi?appid=4b4e4f9a1cadefa9b3b5de461a5ea118&lat=" + lat + "&lon=" + lon, true);
    request.send();
}

function resendAjaxRequest() {
    var user_input = localStorage.getItem('last_searched');
    requestAjaxData(user_input);
    requestAjaxDataFuture(user_input);
    requestAjaxDataForGeolocation(user_input);
}

/// Helpers
function updateTimeAndDate() {
    var current = new Date();
    $('#local-date').text(current.toLocaleDateString());
    $('#local-time').text("Local time: " + current.toLocaleTimeString());

    var today_index = current.getDay(); // A number
    var today = days[today_index]; // String
    // var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    $('#today-day').text(today); // Set today time
    $('#today-date').text(current.toLocaleDateString());

    var forecast = $('.forecast-weather'); // All the forecast day
    var daysToAdd = 1;
    var counter = 0;

    for (var i = today_index + 1; counter < 5; i++) {
        var day = forecast[counter].children[0];
        var date = forecast[counter].children[1];

        if (i == 7) {
            i = 0;
        }
        // Set future days
        day.innerHTML = days[i];
        // Set future dates
        date.innerHTML = setFutureDates(daysToAdd);
        daysToAdd++;
        counter++;
    }
}

function updateTodayInfo(res) {

    if (document.getElementById('weather-section').style.display == 'none') {
        document.getElementById('weather-section').style.display = 'block';
    }

    document.getElementById('today-location').innerHTML = res.name;
    document.getElementById('today-status').innerHTML = res.weather[0].main;
    updateIconToday(res.weather[0].main);
    var celcius = Math.floor(Number(res.main.temp) - 273.15) + '°C';
    var farenheit = Math.floor(Number(res.main.temp) * (9 / 5) - 459.67) + '°F';
    document.getElementById('today-temp').innerHTML = celcius + '/' + farenheit;
    document.getElementById('today-feel').innerHTML = "Feels Like: " + Math.floor(Number(res.main.feels_like) - 273.15) + '°C';
    document.getElementById('today-high').innerHTML = "High: " + Math.floor(Number(res.main.temp_max) - 273.15) + '°C';
    document.getElementById('today-low').innerHTML = "Low: " + Math.floor(Number(res.main.temp_min) - 273.15) + '°C';;
    document.getElementById('today-humid').innerHTML = "Humidity: " + res.main.humidity + '%';
    document.getElementById('today-wind').innerHTML = "Wind: " + Math.round(((Number(res.wind.speed) * 2.237)) * 10) / 10 + ' MPH';
}

function checkOneDayPassed() {
    var current = new Date();
    var zero_hour = current.getHours(); // 0 - 23
    var zero_min = current.getMinutes(); // 0 -59
    var zero_second = current.getSeconds(); // 0 -59

    //If all is 0, meaning a day has passed, so sendAnAjax for future! 
    if (zero_hour == 0 && zero_min == 0 && zero_second == 0) {
        resendAjaxRequest();
    }
}

function checkNoonTime(){
    var current = new Date();
    var hour = current.getHours();
    var second = current.getSeconds();
    var minute = current.getMinutes();

    if(hour == 12 && second == 0 && minute == 15){
       var last_searched = localStorage.getItem('last_searched');
       setTimeout(function(){
           requestAjaxDataForGeolocation(last_searched);
       },1000);
    }
}

function validateAndReturnProperUserInput() {
    var user_input_raw = $('#search-bar').val().trim(); // City's name
    // Make raw input into desirable format
    // If official input (after formatting) is not found from
    // API, then we will just alert(Not found sorry);

    if (user_input_raw == "") {
        alert('Cannot be empty');
        return;
    }

    user_input_raw = user_input_raw.replace(/\s+/g, " ");

    var user_input_lower_case = user_input_raw.toLowerCase();
    // Official user_input
    var user_input = (user_input_lower_case[0].toUpperCase() +
        user_input_lower_case.slice(1));

    return user_input;
}

function updateIconToday(status) {
    if (icon[status]) {
        document.getElementById('today-icon').className = icon[status] + ' center-icon';
    } else {
        document.getElementById('today-icon').className = 'fas fa-smog center-icon';
    }

}

function updateIconFuture(child, status) {
    if (icon[status]) {
        child.children[2].className = icon[status] + ' center-icon';
    } else {
        child.children[2].className = 'fas fa-smog center-icon';
    }
}

function setFutureDates(daysToAdd) {
    var future = new Date();
    future.setDate(future.getDate() + daysToAdd);
    var d = future.getDate();
    var m = future.getMonth() + 1;
    var y = future.getFullYear();
    var future_date = m + '/' + d + '/' + y;
    return future_date;
}