import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Table } from "react-bootstrap";
import Preloader from "./Preloader";

function InputLocation({
  value,
  onLocationChanged,
  onOptionChanged,
  onWindSpeedChanged,
}) {
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
          <div className="form-group">
            <label htmlFor="inlineRadio">Temperature in </label>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input1"
                type="radio"
                name="inlineRadioOptions"
                id="celcius"
                value="celcius"
                onChange={onOptionChanged}
                defaultChecked
              />
              <label className="form-check-label" htmlFor="inlineRadio">
                Celcius
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input1"
                type="radio"
                name="inlineRadioOptions"
                id="fahrenheit"
                value="fahrenheit"
                onChange={onOptionChanged}
              />
              <label className="form-check-label" htmlFor="inlineRadio">
                Fahrenheit
              </label>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="form-group1">
            <label htmlFor="inlineRadio1">Wind Speed in </label>
            <div className="form-check1 form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions1"
                id="km/h"
                value="km/h"
                onChange={onWindSpeedChanged}
                defaultChecked
              />
              <label className="form-check-label" htmlFor="inlineRadio1">
                km/h
              </label>
            </div>
            <div className="form-check1 form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions1"
                id="knot"
                value="knot"
                onChange={onWindSpeedChanged}
              />
              <label className="form-check-label" htmlFor="inlineRadio">
                knot
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function WeatherDetailRow({ aRow }) {
  let dateValues = [];
  let timeValues = [];
  let precisValues = [];
  let temperatureValues = [];
  let wind_speedValues = [];
  let wind_directionValues = [];

  let rowDetails = [
    { header: "Date", values: dateValues },
    { header: "Time", values: timeValues },
    { header: "Precipitation", values: precisValues },
    { header: "Temperature", values: temperatureValues },
    { header: "Wind Speed", values: wind_speedValues },
    { header: "Wind Direction", values: wind_directionValues },
  ];

  aRow.map((props, key) => {
    dateValues.push(<td key={key}>{props.date}</td>);
    timeValues.push(<td key={key}>{props.time}</td>);
    precisValues.push(<td key={key}>{props.precis}</td>);
    temperatureValues.push(<td key={key}>{props.temperature}</td>);
    wind_speedValues.push(<td key={key}>{props.wind_speed}</td>);
    wind_directionValues.push(<td key={key}>{props.wind_direction}</td>);
  });

  return (
    <div>
      <Table striped bordered hover size="sm">
        <tbody className="tbody">
          {rowDetails.map((aRow, key) => (
            <tr key={key}>
              <th key={key}>{aRow.header}</th>
              {aRow.values}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function WeatherComponent() {
  const [location, setLocation] = useState("624"); //Sydney
  const [selectedOption, setSelectedOption] = useState("celcius");
  const [selectedWindSpeed, setSelectedWindSpeed] = useState("km/h");
  const [loadState, setLoadingState] = useState({
    temp: "Loading...",
    loading: true,
  });
  const [weatherDataState, setWeatherDataState] = useState([
    {
      date: "Loading...",
      time: "Loading...",
      precis: "Loading...",
      temperature: "Loading ...",
      wind_direction: "Loading...",
      wind_speed: "Loading...",
    },
  ]);
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
                date: new Date(fcast.local_time).toLocaleDateString(
                  "en-AU",
                  dateOptions
                ),
                time: new Date(fcast.local_time).toLocaleTimeString(
                  "en-AU",
                  timeOptions
                ),
                precis: fcast.precis,
                temperature:
                  selectedOption === "fahrenheit"
                    ? Math.round((fcast.temperature * (9 / 5) + 32) * 10) / 10 +
                      "°"
                    : Math.round(fcast.temperature * 10) / 10 + "°",
                wind_direction:
                  fcast.wind_direction + " " + fcast.wind_direction_compass,
                wind_speed:
                  selectedWindSpeed === "knot"
                    ? Math.round(fcast.wind_speed * 1.852 * 10) / 10
                    : fcast.wind_speed,
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
  useEffect(() => getWeather(), [location, selectedOption, selectedWindSpeed]);
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
            onWindSpeedChanged={(e) => {
              setSelectedWindSpeed(e.target.value);
            }}
          />
          <WeatherDetailRow aRow={weatherDataState} />
        </div>
      </div>
    </div>
  );
}
export default WeatherComponent;
