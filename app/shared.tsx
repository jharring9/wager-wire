import { Fragment, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { DateTime } from "luxon";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const Notification = ({ text, error = false }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (text) {
      setShow(true);
    }
  }, [text]);

  const closeNotification = () => {
    text = null;
    setShow(false);
  };

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="z-50 pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {error ? (
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircleIcon
                        className="h-6 w-6 text-green-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {error ? "Error" : "Success"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{text}</p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={closeNotification}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export const formatShortDate = (isoString) => {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export const formatISODate = (isoString) => {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${month}/${day} @ ${hours}:${formattedMinutes}${ampm}`;
};

export const formatGameDate = (dateObj) => {
  try {
    const localTime = DateTime.fromISO(dateObj).toLocal();
    const dayName = localTime.toFormat("EEEE");
    const hours = localTime.toFormat("h");
    const minutes = (5 * Math.round(localTime.minute / 5))
      .toString()
      .padStart(2, "0");
    const period = localTime.toFormat("a");
    return `${dayName} @ ${hours}:${minutes}${period}`;
  } catch (e) {
    return dateObj;
  }
};

export const checkGameStarted = (date) => {
  const now = DateTime.now().setZone("America/Chicago");
  const gameStart = DateTime.fromISO(date, { zone: "UTC" }).setZone(
    "America/Chicago",
  );
  return now > gameStart;
};
