"use client";

import { useSyncExternalStore } from "react";
import { formatCheckedTime, PACIFIC_TIME_ZONE } from "@/lib/checked-time";

const subscribe = () => () => {};
const serverTimeZone = () => PACIFIC_TIME_ZONE;
function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || PACIFIC_TIME_ZONE;
  } catch {
    return PACIFIC_TIME_ZONE;
  }
}

export function CheckedTime({value}: {value: string}) {
  // Pacific on the server and during hydration; visitor's zone once in the browser.
  const timeZone = useSyncExternalStore(subscribe, browserTimeZone, serverTimeZone);
  return <time dateTime={value}>{formatCheckedTime(value, timeZone)}</time>;
}
