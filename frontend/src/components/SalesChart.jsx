import {
 Bar
} from "react-chartjs-2";

function SalesChart(){

  const data = {

    labels:[
      "T1",
      "T2",
      "T3",
      "T4"
    ],

    datasets:[
      {
        label:"Doanh Thu",
        data:[
          10,
          20,
          15,
          30
        ]
      }
    ]
  };

  return <Bar data={data} />;
}

export default SalesChart;