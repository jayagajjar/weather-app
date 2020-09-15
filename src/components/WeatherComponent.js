import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Table } from "react-bootstrap";
import Preloader from "./Preloader";

function InputLocation({ value, onLocationChanged }) {
  return (
    <form>
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
    </form>
  );
}

function WeatherDetailRow({ aRow }) {
  const items = [];
  for (let props in aRow) {
    items.push(
      <tr>
        <td> {aRow[props].date}</td>
        <td> {aRow[props].precis}</td>
        <td>{aRow[props].temperature} </td>
        <td>{aRow[props].wind_speed} </td>
        <td>{aRow[props].wind_direction}</td>
      </tr>
    );
  }

  return (
    <div>
      <Table striped bordered hover size="sm">
        <thead className="thead">
          <tr>
            <th>Date and Time</th>
            <th>Precipitation</th>
            <th>Temperature</th>
            <th>Wind Speed</th>
            <th>Wind Direction</th>
          </tr>
        </thead>
        <tbody className="tbody">{items}</tbody>
      </Table>
    </div>
  );
}

function WeatherComponent() {
  const [location, setLocation] = useState("624"); //Sydney
  const [loadState, setLoadingState] = useState({
    temp: "Loading...",
    loading: true,
  });
  const [weatherDataState, setWeatherDataState] = useState({
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
          var options = {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZone: "Australia/Sydney",
          };
          data.countries[0].locations[0].part_day_forecasts.forecasts.map(
            (fcast) => {
              labels.push(new Date(fcast.local_time).getHours());
              temps.push(fcast.temperature);
            }
          );
          data.countries[0].locations[0].part_day_forecasts.forecasts.map(
            (fcast) =>
              aRow.push({
                date: new Intl.DateTimeFormat("en-AU", options).format(
                  new Date(fcast.local_time)
                ),
                precis: fcast.precis,
                temperature: fcast.temperature + "°",
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

          setLoadingState(() => {
            return { temp: temp, loading: false };
          });
        },
        (err) => {
          setLoadingState("Error", false);
        }
      );
  };

  useEffect(() => getWeather(), [location]);
  return (
    <div>
      <div>
        <Preloader show={loadState.loading} />
      </div>
      <Line data={chartDataState} />
      <InputLocation
        value={location}
        onLocationChanged={(e) => {
          setLocation(e.target.value);
        }}
      />
      <WeatherDetailRow aRow={weatherDataState} />
    </div>
  );
}
export default WeatherComponent;
