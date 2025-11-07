import { UserState } from "../../enums/enums";

export interface User2Auth {
username: string,
  password: string,
  email:string,
  state: UserState,
  creationDate: "",
  updateDate: ""
}