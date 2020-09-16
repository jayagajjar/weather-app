import React, { useEffect, useState, Fragment } from "react";
import { Line } from "react-chartjs-2";
import { Table } from "react-bootstrap";
import Preloader from "./Preloader";

function InputLocation({ value, onLocationChanged, onOptionChanged }) {
  return (
    <form>
      <div className="row">
        <div className="col">
          <label>
            Select Location:
            <select value={value} onChange={onLocationChanged}>
              <option value="12495">Adelaide</option>
              <option value="9388">Brisbane</option>
              <option value="3928">Canberra</option>
              <option value="11">Darwin</option>
              <option value="15465">Hobart</option>
              <option value="5594">Melbourne</option>
              <option value="13896">Perth</option>
              <option value="624">Sydney</option>
            </select>
          </label>
        </div>
        <div className="col">
          <label htmlFor="inlineRadio1">Temperature in </label>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="celcius"
              value="celcius"
              onChange={onOptionChanged}
              defaultChecked
            />
            <label className="form-check-label" htmlFor="inlineRadio1">
              Celcius
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="fahrenheit"
              value="fahrenheit"
              onChange={onOptionChanged}
            />
            <label className="form-check-label" htmlFor="inlineRadio2">
              Fahrenheit
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

function WeatherDetailRow({ aRow }) {
  const items = [];

  let i = 0;
  let dateValues = [];
  let timeValues = [];
  let precisValues = [];
  let temperatureValues = [];
  let wind_speedValues = [];
  let wind_directionValues = [];
  for (let props in aRow) {
    dateValues.push(<td key={i++}>{aRow[props].date}</td>);
    timeValues.push(<td key={i++}>{aRow[props].time}</td>);
    precisValues.push(<td key={i++}>{aRow[props].precis}</td>);
    temperatureValues.push(<td key={i++}>{aRow[props].temperature}</td>);
    wind_speedValues.push(<td key={i++}>{aRow[props].wind_speed}</td>);
    wind_directionValues.push(<td key={i++}>{aRow[props].wind_direction}</td>);
  }
  items.push(
    <Fragment key={i++}>
      <tr key={i++}>
        <th key={i++}>Date</th>
        {dateValues}
      </tr>
      <tr key={i++}>
        <th key={i++}>Time</th>
        {timeValues}
      </tr>
      <tr key={i++}>
        <th key={i++}>Precipitation</th>
        {precisValues}
      </tr>
      <tr key={i++}>
        <th key={i++}>Temperature</th>
        {temperatureValues}
      </tr>
      <tr key={i++}>
        <th key={i++}>Wind Speed</th>
        {wind_speedValues}
      </tr>
      <tr key={i++}>
        <th key={i++}>Wind Direction</th>
        {wind_directionValues}
      </tr>
    </Fragment>
  );

  return (
    <div>
      <Table striped bordered hover size="sm">
        <tbody className="tbody">{items}</tbody>
      </Table>
    </div>
  );
}

function WeatherComponent() {
  const [location, setLocation] = useState("624"); //Sydney
  const [selectedOption, setSelectedOption] = useState("celcius");

  const [loadState, setLoadingState] = useState({
    temp: "Loading...",
    loading: true,
  });
  const [weatherDataState, setWeatherDataState] = useState({
    date: "Loading...",
    time: "Loading...",
    precis: "Loading...",
    temperature: "Loading ...",
    wind_direction: "Loading...",
    wind_speed: "Loading...",
  });
  const [chartDataState] = useState({
    labels: [],
    datasets: [
      {
        label: "Temperature",
        data: [],
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  });

  let labels;
  let temps;
  const getWeather = () => {
    labels = [];
    temps = [];
    let api = `https://ws.weatherzone.com.au/?lt=aploc&lc=${location}&locdet=1&latlon=1&pdf=twc(period=48,detail=2)&u=1&format=json`;
    fetch(api)
      .then((res) => res.json())
      .then(
        (data) => {
          let aRow = [];
          var dateOptions = {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          };
          var timeOptions = {
            timeZoneName: "short",
            timeZone: "Australia/Sydney",
          };
          let timeOptionsChart = {};
          data.countries[0].locations[0].part_day_forecasts.forecasts.map(
            (fcast) => {
              labels.push(
                new Date(fcast.local_time).toLocaleTimeString(
                  "en-AU",
                  timeOptionsChart
                )
              );
              temps.push(
                selectedOption === "fahrenheit"
                  ? fcast.temperature * (9 / 5) + 32
                  : fcast.temperature
              );
            }
          );

          data.countries[0].locations[0].part_day_forecasts.forecasts.map(
            (fcast) =>
              aRow.push({
                date: new Intl.DateTimeFormat("en-AU", dateOptions).format(
                  new Date(fcast.local_time)
                ),
                time: new Date(fcast.local_time).toLocaleTimeString(
                  "en-AU",
                  timeOptions
                ),
                precis: fcast.precis,
                temperature:
                  selectedOption === "fahrenheit"
                    ? Math.round(fcast.temperature * (9 / 5) + 32 * 10) / 10 +
                      "°"
                    : Math.round(fcast.temperature * 10) / 10 + "°",
                wind_direction:
                  fcast.wind_direction + " " + fcast.wind_direction_compass,
                wind_speed: fcast.wind_speed,
              })
          );
          let temp;
          setWeatherDataState(() => {
            return aRow;
          });
          chartDataState.labels = labels;
          chartDataState.datasets[0].data = temps;
          chartDataState.datasets[0].label =
            "Temperature in " +
            selectedOption.charAt(0).toUpperCase() +
            selectedOption.slice(1);

          setLoadingState(() => {
            return { temp: temp, loading: false };
          });
        },
        (err) => {
          setLoadingState("Error", false);
        }
      );
  };

  useEffect(() => getWeather(), [location, selectedOption]);
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <Preloader show={loadState.loading} />

          <Line data={chartDataState} width={800} />
          <InputLocation
            value={location}
            onLocationChanged={(e) => {
              setLocation(e.target.value);
            }}
            onOptionChanged={(e) => {
              setSelectedOption(e.target.value);
            }}
          />
          <WeatherDetailRow aRow={weatherDataState} />
        </div>
      </div>
    </div>
  );
}
export default WeatherComponent;
