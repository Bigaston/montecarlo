let LOG = true;

export function setLog(value: boolean) {
  LOG = value;
}

export function log(data: any) {
  if (LOG) {
    console.log(data);
  } else {
  }
}
