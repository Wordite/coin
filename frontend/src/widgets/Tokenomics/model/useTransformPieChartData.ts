const useTransformPieChartData = (data: any) => {
  return data.map((item: any) => ({
    name: item.textField1,
    percentage: parseInt(item.textField2),
    color: item.textField3,
    countOfTokens: item.textField4,
  }))
}

export { useTransformPieChartData }
