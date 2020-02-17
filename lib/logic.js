// var moment = require('moment');
// var d = moment().add(5,'days');
// console.log(d.format('M/DD/YYYY'));

/* Functionality:
1) Write name of city into input (id="search-bar") and press id="search-icon" will create an option,
, give it a id == valueOfInput, append into id="city-list" and save the array of value into local Storage called "searched_city"

** Caveat: If list exist in local storage, Make sure to displayContentFromLocalStorage

3) Once refresh, take the Last city

---- API Part here --------
4) Snatch data from OpenWeather API
- For Today: Get STATUS + 
+ main temperatature, feels like, high, low, humidty, precip, wind, UV

For UV:
1-2 = Low = Green
3-5 = Moderate = Yellw
6-7 = High = Orange
8-10+ = Extreme = Red

- For future, get STATUS + Main temp, High, low, precip, wind

5) 

*/


// Data needs Date, Icon to show, temp (High, Low) feels like, humidty, UV index, Wind speed,
var searched_city_list = JSON.parse(localStorage.getItem('searched_city'));
var selected = localStorage.getItem('last_searched'); // If searched
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function displayContentFromLocalStorage(){
    // Display search history upon refresh 

    var searched_city_list = JSON.parse(localStorage.getItem('searched_city'));
    if(!searched_city_list){
        document.getElementById('weather-section').style.display = 'none';
        return;
    } else {
        for(var i = 0 ; i < searched_city_list.length;i++){
            var option = document.createElement('option');
            option.id = searched_city_list[i];
            option.innerHTML = searched_city_list[i];
            $('#city-list').append(option);
        }
    }
}

displayContentFromLocalStorage();

$(document).ready(function(){
    var current = new Date();

    $('#local-date').text(current.toLocaleDateString());
    $('#local-time').text("Local time: " + current.toLocaleTimeString());
    updateTimeAndDate();
    var timeChecker = setInterval(updateTimeAndDate,1000);

    // Upon refresh, make sure the current city is the last selected one
    $('#today-location').text(selected);
    $('select').val(selected); // Also the search bar should go to the last search

    // Search function 
    $('#search-icon').on('click', function(){
      
        var user_input_raw = $('#search-bar').val().trim();// City's name
        // Make raw input into desirable format
        // If official input (after formatting) is not found from
        // API, then we will just alert(Not found sorry);

        if(user_input_raw == ""){
            alert('empty');
            return;
        }
   
        var user_input_lower_case = user_input_raw.toLowerCase();
        // Official user_input
        var user_input =  (user_input_lower_case[0].toUpperCase() + 
        user_input_lower_case.slice(1));
        
        
        if(document.getElementById('weather-section').style.display == 'none'){
            document.getElementById('weather-section').style.display = 'block';
        }

        // ***** MISSING THIS ***** 
        // If(user_input is found then do this, if not alert())

        var option = document.createElement('option');
        option.id = user_input;
        option.innerHTML = user_input;

        if(!searched_city_list){
            searched_city_list = [];
            searched_city_list.push(user_input);
            $('#city-list').append(option);
            $('#today-location').text(user_input);
            localStorage.setItem('searched_city', JSON.stringify(searched_city_list));
        } else {
            // If list does not contain the value, then push it in
            if(!searched_city_list.includes(user_input)){
                searched_city_list.push(user_input);
                $('#city-list').append(option);
                $('#today-location').text(user_input);
                localStorage.setItem('searched_city', JSON.stringify(searched_city_list));
            }
        }

        //Saved in local storage
        $('#today-location').text(user_input);
        localStorage.setItem('last_searched', user_input);
    })

    // Search-history function 
    $('select').on('change',function(){
        //If changed to another one, update last searched
        $('#today-location').text(this.value);
        localStorage.setItem('last_searched', this.value);
    })

    //////// WEATHER SECTION CLASS 
    // Today id


    //
    // Forecast id 

})



// Javascript Function
function updateTimeAndDate(){
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
   
    for(var i = today_index + 1; counter < 5; i++){
        var day = forecast[counter].children[0];
        var date = forecast[counter].children[1];

        if(i == 7){
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

// Helper
function setFutureDates(daysToAdd){
    var future = new Date();
    future.setDate(future.getDate() + daysToAdd);
    var d = future.getDate();
    var m = future.getMonth() + 1;
    var y = future.getFullYear();
    var future_date = m + '/' + d + '/' + y;
    return future_date;
}