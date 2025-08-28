export class GraficoModel {
  public labels: string[];
  public datasets: DatasetsModel[];

  constructor(label: string[], datasets: DatasetsModel[]) {
    this.labels = label;
    this.datasets = datasets;
  }
}

export class DatasetsModel {
  public label: string;
  public data: number[];
  public backgroundColor: string[];

  constructor(label: string, data: number[], backgroundColor: string[]) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
  }
}
