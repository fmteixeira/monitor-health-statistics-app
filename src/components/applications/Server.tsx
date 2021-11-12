import moment from "moment";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useParams } from "react-router-dom";

import Page from "@/components/Page";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/requests/api/api";
import { unixMiliToDateString, unixMiliToSecs } from "@/resources/functions";
import { ServerUptime } from "@/resources/interfaces";
import { getServerUptime } from "@/resources/statistics";

export default function Server(): JSX.Element {
  // Router
  const params = useParams();

  // State
  const [fromDate, setFromDate] = useState<Date | null>(
    moment().subtract(1, "months").toDate()
  );
  const [toDate, setToDate] = useState<Date | null>(moment().toDate());

  const [statistics, setStatistics] = useState<ServerUptime | undefined>(
    undefined
  );

  useEffect(() => {
    if (params.app && params.server && fromDate && toDate) {
      api
        .getServiceHistory(params.app, params.server, fromDate, toDate)
        .then((res) => {
          console.log("res: ", res);
          if (res) setStatistics(getServerUptime(res));
        })
        .catch(() => {});
    }
  }, [fromDate, toDate]);

  return (
    <RequireAuth>
      <Page centerHor centerVer>
        <div>
          <div>
            <span>From: </span>
            <DatePicker
              selected={fromDate}
              onChange={(date) => !Array.isArray(date) && setFromDate(date)}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <span>To: </span>
            <DatePicker
              selected={toDate}
              onChange={(date) => !Array.isArray(date) && setToDate(date)}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          {statistics && (
            <ul>
              <li>
                <code>
                  Firt Report: {unixMiliToDateString(statistics.startTime)}
                </code>
              </li>
              <li>
                <code>
                  Last Report: {unixMiliToDateString(statistics.endTime)}
                </code>
              </li>
              <li>
                <code>Report Count: {statistics.reportCount}</code>
              </li>
              <li>
                <code>
                  Elapsed Time: {unixMiliToSecs(statistics.elapsed)} seconds
                </code>
              </li>
              <li>
                <code>Uptime: {unixMiliToSecs(statistics.uptime)} seconds</code>
              </li>
              <li>
                <code>
                  Uptime Percentage:{" "}
                  {(statistics.uptime / statistics.elapsed) * 100}%
                </code>
              </li>
            </ul>
          )}
        </div>
      </Page>
    </RequireAuth>
  );
}