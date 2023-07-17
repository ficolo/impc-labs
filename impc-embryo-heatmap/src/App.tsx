import React, { useEffect, useState } from "react";
import "./App.css";
import { data } from "./GeneVsProcedure.data";
import { AxisTick } from "@nivo/axes";
import Select from "react-select";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import PaginationComponent from "./Pagination";

function App() {
  const [selectedGenes, setSelectedGenes] = useState<any>([]);
  const [chartData, setChartData] = useState<any>(data.slice(0, 25));
  const [dataIndex, setDataIndex] = useState<any>({});
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(data.length / 25));
  const windowOfLetality = [
    { value: "Perinatal lethal", label: "Perinatal lethal" },
    { value: "E9.5 lethal", label: "E9.5 lethal" },
    { value: "E12.5 lethal", label: "E12.5 lethal" },
    { value: "E15.5 lethal", label: "E15.5 lethal" },
    { value: "E18.5 lethal", label: "E18.5 lethal" },
    { value: "Lorem ipsum", label: "Lorem ipsum" },
  ];
  function csvToJSON(csv: string) {
    var lines = csv.split("\n");
    var result = [];
    var headers;
    headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
      var obj: any = {};

      if (lines[i] == undefined || lines[i].trim() == "") {
        continue;
      }

      var words = lines[i].split(",");
      for (var j = 0; j < words.length; j++) {
        obj[headers[j].trim()] = words[j];
      }

      result.push(obj);
    }
    return result;
  }
  const geneIndex = chartData.reduce((acc: any, d: any) => {
    return { [d.id]: d.mgiAccessionId, ...acc };
  }, {});
  console.log(geneIndex);

  useEffect(() => {
    fetch(
      "//impc-datasets.s3.eu-west-2.amazonaws.com/embryo-landing-assets/wol_all.csv"
    )
      .then((res) => res.text())
      .then((res) => {
        var dataValues = csvToJSON(res);
        let dataIndex = {
          "Perinatal lethal": dataValues.filter((d) =>
            d.wol.includes("perinatal_lethal")
          ),
          "E9.5 lethal": dataValues.filter((d) =>
            d.wol.includes("E9_5_lethal")
          ),
          "E12.5 lethal": dataValues.filter((d) =>
            d.wol.includes("E12_5_lethal")
          ),
          "E15.5 lethal": dataValues.filter((d) =>
            d.wol.includes("E15_5_lethal")
          ),
          "E18.5 lethal": dataValues.filter((d) =>
            d.wol.includes("E18_5_lethal")
          ),
          "Lorem ipsum": dataValues.filter((d) =>
            d.wol.includes("insufficient data")
          ),
        };
        setDataIndex(dataIndex);
      });
  }, []);

  const handlePaginationChange = (pageNumber: number) => {
    setActivePage(pageNumber);
    setChartData(
      data
        .slice((pageNumber - 1) * 25, (pageNumber - 1) * 25 + 25)
        .map((d: any) => ({
          ...d,
          mgiAccessionId: d.mgiAccessionId,
          ...d.phenotype,
        }))
    );
  };

  return (
    <>
      <div className="row m-2 ">
        <div className="col-6">
          <Select
            onChange={(selected) => {
              setSelectedGenes(
                selected
                  .flatMap((s) => dataIndex[s.value])
                  .map((d) => d.gene_id)
              );
              const newData = selected.length
                ? data.filter((g: any) =>
                    selected
                      .flatMap((s) => dataIndex[s.value])
                      .map((d) => d.gene_id)
                      .includes(g.mgiAccessionId)
                  )
                : data;
              setChartData(
                selected.length ? newData.slice(0, 25) : data.slice(0, 25)
              );
              setTotalPages(Math.ceil(newData.length / 25));
              setActivePage(1);
            }}
            options={windowOfLetality}
            isMulti
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select window of lethality"
            styles={{
              container: (provided, state) => ({
                ...provided,
                padding: "0",
                border: "0",
              }),
              control: (provided, state) => ({
                ...provided,
                borderColor: "#ce6211",
                boxShadow: "inset 0 1px 1px rgba(0, 0, 0, 0.075)",
                transition:
                  "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                ":hover": {
                  borderColor: state.isFocused ? "#e9b066" : "#ce6211",
                  boxShadow: state.isFocused
                    ? "inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(237, 123, 37, 0.6)"
                    : "inset 0 1px 1px rgba(0, 0, 0, 0.075)",
                },
              }),
              valueContainer: (provided, state) => ({
                ...provided,
                marginTop: "0",
                marginLeft: "6px",
                padding: "0",
                border: "0",
              }),
              dropdownIndicator: (provided, state) => ({
                ...provided,
                marginTop: "0",
                padding: "0",
                border: "0",
                width: "16px",
              }),
              clearIndicator: (provided, state) => ({
                ...provided,
                marginTop: "0",
                padding: "0",
                border: "0",
                width: "16px",
              }),
              indicatorsContainer: (provided, state) => ({
                ...provided,
                paddingRight: "4px",
                border: "0",
              }),
            }}
          />
        </div>
        <div className="col-6"></div>
      </div>
      <div
        style={{
          height: `${
            chartData.length < 25 ? 250 + chartData.length * 5 : 600
          }px`,
          marginRight: "0",
          marginLeft: "0",
          backgroundColor: "white",
          marginTop: "0",
        }}
      >
        <ResponsiveHeatMap
          data={chartData}
          margin={{ top: 100, right: 80, bottom: 20, left: 120 }}
          valueFormat={(v: any) => {
            const options = [
              "No data",
              "Images Available",
              "Images Available",
              "EA not significant -> LA significant",
              "Images and Automated Volumetric Analysis Available",
            ];
            return options[v];
          }}
          animate={true}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "",
            legendOffset: 50,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendPosition: "middle",
            legendOffset: 60,
            renderTick: (tick: any) => (
              <ClickableAxisTick
                tick={tick}
                onClick={() =>
                  window.open(
                    `https://mousephenotype.org/data/genes/${
                      data[tick.tickIndex].mgiAccessionId
                    }`,
                    "_blank",
                    "noreferrer"
                  )
                }
              />
            ),
          }}
          axisRight={null}
          colors={(cell: any) => {
            const options = [
              "#ECECEC",
              "#17a2b8",
              "#ed7b25",
              "#ed7b25",
              "#17a2b8",
            ];
            return options[cell.value || 0];
          }}
          labelTextColor="black"
          emptyColor="#ccc"
          borderWidth={0.25}
          borderColor="#000"
          enableLabels={false}
          legends={[
            {
              anchor: "right",
              translateX: 50,
              translateY: 0,
              length: 200,
              thickness: 10,
              direction: "column",
              tickPosition: "after",
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              tickFormat: ">-.0s",
              title: "Value →",
              titleAlign: "middle",
              titleOffset: 4,
            },
          ]}
          annotations={[]}
          onClick={(cell: any) => {
            const geneAcc = geneIndex[cell.serieId];
            const dataType = cell.data.x;
            let url = "";
            if (
              ["OPT E9.5", "MicroCT E14.5-E15.5", "MicroCT E18.5"].includes(
                dataType
              )
            ) {
              url = `//www.mousephenotype.org/embryoviewer/?mgi=${geneAcc}`;
            } else if (dataType === "Vignettes") {
            } else if (dataType === "LacZ") {
              url = `//www.mousephenotype.org/data/imageComparator?parameter_stable_id=IMPC_ELZ_064_001&acc=${geneAcc}`;
            } else {
              url = `//blogs.umass.edu/jmager/${cell.serieId}`;
            }

            window.open(url, "_blank", "noreferrer");
          }}
        />

        {/* <ResponsiveHeatmapCanvasClickable
          data={
            selectedGenes.length
              ? chartData.filter((g: any) =>
                  selectedGenes.includes(g.mgiAccessionId)
                )
              : chartData
          }
          margin={{ top: 100, right: 80, bottom: 20, left: 120 }}
          valueFormat={(v: any) => {
            const options = [
              "No data",
              "Images Available",
              "Images Available",
              "EA not significant -> LA significant",
              "Images and Automated Volumetric Analysis Available",
            ];
            return options[v];
          }}
          animate={false}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "",
            legendOffset: 50,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendPosition: "middle",
            legendOffset: 60,
            renderTick: (tick: any) => (
              <ClickableAxisTick
                tick={tick}
                onClick={() =>
                  window.open(
                    `https://mousephenotype.org/data/genes/${
                      data[tick.tickIndex].mgiAccessionId
                    }`,
                    "_blank",
                    "noreferrer"
                  )
                }
              />
            ),
          }}
          axisRight={null}
          colors={(cell: any) => {
            const options = [
              "#ECECEC",
              "#17a2b8",
              "#ed7b25",
              "#ed7b25",
              "#17a2b8",
            ];
            return options[cell.value || 0];
          }}
          labelTextColor="black"
          emptyColor="#ccc"
          borderWidth={0.25}
          borderColor="#000"
          enableLabels={false}
          legends={[
            {
              anchor: "right",
              translateX: 50,
              translateY: 0,
              length: 200,
              thickness: 10,
              direction: "column",
              tickPosition: "after",
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              tickFormat: ">-.0s",
              title: "Value →",
              titleAlign: "middle",
              titleOffset: 4,
            },
          ]}
          annotations={[]}
          onClick={(cell: any) => console.log(cell.data)}
          //hoverTarget="row"
        /> */}
      </div>
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={(page) => {
            handlePaginationChange(page);
          }}
        />
      )}
    </>
  );
}

const ClickableAxisTick = ({
  tick,
  onClick,
}: {
  tick: any;
  onClick: (tick: any) => void;
}) => {
  return <AxisTick {...tick} onClick={onClick} />;
};

export default App;
