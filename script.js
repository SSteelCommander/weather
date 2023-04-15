var key = "b2a0ce7aedc63266d0d1ccd9c13cb853";
var currentCity = "Richmond";
var dateAndTime = moment().format("YYYY-MM-DD HH:MM:SS");
var currentDate = moment().format("dddd, MMMM Do YYYY");
var forecastfive = $(".fiveForecast");
var todayWeather = $(".todayDes");
var Meta = [];
var contHistEl = $(".Meta");

function currentHistory() {
  contHistEl.empty();

  for (let i = 0; i < Meta.length; i++) {
    rowEl.addClass("row histBtnRow");
    btnEl.addClass("btn btn-outline-secondary histBtn");
    var rowEl = $("<row>");
    var btnEl = $("<button>").text(`${Meta[i]}`);
    contHistEl.prepend(rowEl);
    rowEl.append(btnEl);
    btnEl.attr("type", "button");
  }
  if (!currentCity) {
    return;
  }
  //Button will start a search
  $(".histBtn").on("click", function (event) {
    event.preventDefault();
    currentCity = $(this).text();
    forecastfive.empty();
    getWeatherToday();
  });
}

//Text value save
$(".search").on("click", function (event) {
  event.preventDefault();
  currentCity = $(this).parent(".btnPar").siblings(".textVal").val().trim();
  if (currentCity === "") {
    return;
  }
  Meta.push(currentCity);

  localStorage.setItem("currentCity", JSON.stringify(Meta));
  forecastfive.empty();
  currentHistory();
  getWeatherToday();
});

// Forcast
function getWeatherToday() {
  var getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&units=imperial&appid=${key}`;

  $(todayWeather).empty();

  $.ajax({
    url: getUrlCurrent,
    method: "GET",
  }).then(function (response) {
    $(".currentCityNameToday").text(response.name);
    $(".dateToday").text(currentDate);
    //imported
    $(".imported").attr(
      "src",
      `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
    );
    var pElTemp = $("<p>").text(`Feels Like: ${response.main.feels_like} °F`);
    todayWeather.append(pElTemp);
    //Humidity (value)
    var pElHumid = $("<p>").text(`Humidity: ${response.main.humidity} %`);
    todayWeather.append(pElHumid);
    //Wind Speed (value)
    var pElWind = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
    todayWeather.append(pElWind);
    // Temperature (Value)
    var pEl = $("<p>").text(`Temperature: ${response.main.temp} °F`);
    todayWeather.append(pEl);
    //Feels Like (value)
    //Set the latitude and longitude
    var lonigtude = response.coord.lon;
    // console.log(lonigtude); -remove later
    var Latitude = response.coord.lat;
    // console.log(Latitude); -remove later

    var UrlLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${Latitude}&lon=${lonigtude}&exclude=hourly,daily,minutely&appid=${key}`;

    $.ajax({
      url: UrlLink,
      method: "GET",
    }).then(function (response) {
      var exposedSpan = $("<span>").text(response.current.exposed);
      var exposed = response.current.exposed;
      var pElexposed = $("<p>").text(`UV Index: `);
      pElexposed.append(exposedSpan);
      todayWeather.append(pElexposed);
      //exposer chart
      if (exposed  <= 2) {
        exposedSpan.attr("class", "green");
      } else if (exposed <= 5) {
        exposedSpan.attr("class", "yellow");
      } else if ( exposed <= 7) {
        exposedSpan.attr("class", "orange");
      } else if ( exposed <= 10) {
        exposedSpan.attr("class", "red");
      } else {
        exposedSpan.attr("class", "purple");
      }
    });
  });
  getFiveDayForecast();
}

//set city richmond
function initLoad() {
  var CityHistStore = JSON.parse(localStorage.getItem("currentCity"));
  //if no city use richmond
  if (CityHistStore !== null) {
    Meta = CityHistStore;
  }
  getWeatherToday();
  currentHistory();
}
//get the url data for the five day forcast
function getFiveDayForecast() {
  var fiveDaysURL = `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&units=imperial&appid=${key}`;
  //get method
  $.ajax({
    url: fiveDaysURL,
    method: "GET",
    //get obj for array
  }).then(function (response) {
    var fiveDayArray = response.list;
    var myWeather = [];
    //data read object
    $.each(fiveDayArray, function (index, value) {
      testObj = {
        temp: value.main.temp,
        icon: value.weather[0].icon,
        time: value.dt_txt.split(" ")[1],
        currentDate: value.dt_txt.split(" ")[0],
        feels_like: value.main.feels_like,
        humidity: value.main.humidity,
      };
      //make sure that
      if (value.dt_txt.split(" ")[1] === "12:00:00") {
        myWeather.push(testObj);
      }
    });

    //set cards
    for (let i = 0; i < myWeather.length; i++) {
      //set card
      var divElCard = $("<div>");
      divElCard.attr("class", "card text-white bg-primary mb-3 cardOne");
      divElCard.attr("style", "max-width: 200px;");
      forecastfive.append(divElCard);
      //set header
      var divElHeader = $("<div>");
      divElHeader.attr("class", "card-header");
      var m = moment(`${myWeather[i].currentDate}`).format("MM-DD-YYYY");
      divElHeader.text(m);
      divElCard.append(divElHeader);
      //set body
      var divElBody = $("<div>");
      divElBody.attr("class", "card-body");
      divElCard.append(divElBody);
      //weather image
      var divElIcon = $("<img>");
      divElIcon.attr("class", "imported");
      divElIcon.attr(
        "src",
        `https://openweathermap.org/img/wn/${myWeather[i].icon}@2x.png`
      );
      divElBody.append(divElIcon);

      //Tempature (value)
      var pElTemp = $("<p>").text(`Temperature: ${myWeather[i].temp} °F`);
      divElBody.append(pElTemp);
      //Feels Like (value)
      var pElFeel = $("<p>").text(`Feels Like: ${myWeather[i].feels_like} °F`);
      divElBody.append(pElFeel);
      //Humidity (value)
      var pElHumid = $("<p>").text(`Humidity: ${myWeather[i].humidity} %`);
      divElBody.append(pElHumid);
    }
  });
}

initLoad();
