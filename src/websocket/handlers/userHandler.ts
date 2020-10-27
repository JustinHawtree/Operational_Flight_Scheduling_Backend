export function userHandler(action: string, payload: any, callback: any) {
  switch (action) {
    case "add":
      console.log("this is addding case!");
      break;
    case "edit":
      console.log("this is editing case!");
      break;
    case "delete":
      console.log("this is deleting case!");
      break;
    default:
      console.log("not a valid action");
      break;
  }
}