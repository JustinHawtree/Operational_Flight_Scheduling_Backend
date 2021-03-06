export const formatSetSQL = (validArray: Array<any>, dataObj: any, required: boolean): [string, Array<any>] => {
  let validObj: any = {};
  let values: Array<any> = [];
  let patchString = "SET ";

  let valuePos = 1;

  if (required) {
    validArray.forEach((item) => {
      // add column_name = $#,
      patchString += `${item} = ${"$"+valuePos},`;
      // update valid position
      valuePos += 1;
      // appends the value from the user to the values array
      values.push(dataObj[item]);
    })

  } else {
    for (let i = 0; i < validArray.length; i++) {
      validObj[validArray[i]] = true;
    }

    Object.keys(dataObj).forEach((bodyProp) => {
      if (validObj[bodyProp]) {
        // add column_name = $#,
        patchString += `${bodyProp} = ${"$"+valuePos},`;
        // update valid position
        valuePos += 1;
        // appends the value from the user to the values array
        values.push(dataObj[bodyProp]);
      }
    });
  }

  patchString = patchString.slice(0, -1);

  if (values.length !== 0) {
    return [patchString, values];
  } else {
    return ["", []];
  }
}