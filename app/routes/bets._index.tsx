import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: "WagerWire - Your Bets" }];

export default function YourBetsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
      <h1>Information on your bets is coming soon.</h1>
      {/*<div>*/}
      {/*  <h2 className="text-base font-semibold leading-7 text-gray-900">*/}
      {/*    Your Information*/}
      {/*  </h2>*/}
      {/*  <p className="mt-1 text-sm leading-6 text-gray-500">*/}
      {/*    This information is not publicly available.*/}
      {/*  </p>*/}

      {/*  <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">*/}
      {/*    <div className="pt-6 sm:flex">*/}
      {/*      <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">*/}
      {/*        Your Name*/}
      {/*      </dt>*/}
      {/*      <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">*/}
      {/*        <div className="text-gray-900">Tom Cook</div>*/}
      {/*        <button*/}
      {/*          type="button"*/}
      {/*          className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*        >*/}
      {/*          Update*/}
      {/*        </button>*/}
      {/*      </dd>*/}
      {/*    </div>*/}
      {/*    <div className="pt-6 sm:flex">*/}
      {/*      <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">*/}
      {/*        Email address*/}
      {/*      </dt>*/}
      {/*      <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">*/}
      {/*        <div className="text-gray-900">email@example.com</div>*/}
      {/*        <button*/}
      {/*          type="button"*/}
      {/*          className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*        >*/}
      {/*          Update*/}
      {/*        </button>*/}
      {/*      </dd>*/}
      {/*    </div>*/}
      {/*    <div className="pt-6 sm:flex">*/}
      {/*      <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">*/}
      {/*        Password*/}
      {/*      </dt>*/}
      {/*      <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">*/}
      {/*        <div className="text-gray-900">Human Resources Manager</div>*/}
      {/*        <button*/}
      {/*          type="button"*/}
      {/*          className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*        >*/}
      {/*          Update*/}
      {/*        </button>*/}
      {/*      </dd>*/}
      {/*    </div>*/}
      {/*  </dl>*/}
      {/*</div>*/}

      {/*<div>*/}
      {/*  <h2 className="text-base font-semibold leading-7 text-gray-900">*/}
      {/*    Bank accounts*/}
      {/*  </h2>*/}
      {/*  <p className="mt-1 text-sm leading-6 text-gray-500">*/}
      {/*    Connect bank accounts to your account.*/}
      {/*  </p>*/}

      {/*  <ul className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">*/}
      {/*    <li className="flex justify-between gap-x-6 py-6">*/}
      {/*      <div className="font-medium text-gray-900">TD Canada Trust</div>*/}
      {/*      <button*/}
      {/*        type="button"*/}
      {/*        className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*      >*/}
      {/*        Update*/}
      {/*      </button>*/}
      {/*    </li>*/}
      {/*    <li className="flex justify-between gap-x-6 py-6">*/}
      {/*      <div className="font-medium text-gray-900">*/}
      {/*        Royal Bank of Canada*/}
      {/*      </div>*/}
      {/*      <button*/}
      {/*        type="button"*/}
      {/*        className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*      >*/}
      {/*        Update*/}
      {/*      </button>*/}
      {/*    </li>*/}
      {/*  </ul>*/}

      {/*  <div className="flex border-t border-gray-100 pt-6">*/}
      {/*    <button*/}
      {/*      type="button"*/}
      {/*      className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"*/}
      {/*    >*/}
      {/*      <span aria-hidden="true">+</span> Add another bank*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div>*/}
      {/*  <h2 className="text-base font-semibold leading-7 text-gray-900">*/}
      {/*    Integrations*/}
      {/*  </h2>*/}
      {/*  <p className="mt-1 text-sm leading-6 text-gray-500">*/}
      {/*    Connect applications to your account.*/}
      {/*  </p>*/}

      {/*  <ul className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">*/}
      {/*    <li className="flex justify-between gap-x-6 py-6">*/}
      {/*      <div className="font-medium text-gray-900">QuickBooks</div>*/}
      {/*      <button*/}
      {/*        type="button"*/}
      {/*        className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*      >*/}
      {/*        Update*/}
      {/*      </button>*/}
      {/*    </li>*/}
      {/*  </ul>*/}

      {/*  <div className="flex border-t border-gray-100 pt-6">*/}
      {/*    <button*/}
      {/*      type="button"*/}
      {/*      className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"*/}
      {/*    >*/}
      {/*      <span aria-hidden="true">+</span> Add another application*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div>*/}
      {/*  <h2 className="text-base font-semibold leading-7 text-gray-900">*/}
      {/*    Language and dates*/}
      {/*  </h2>*/}
      {/*  <p className="mt-1 text-sm leading-6 text-gray-500">*/}
      {/*    Choose what language and date format to use throughout your account.*/}
      {/*  </p>*/}

      {/*  <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">*/}
      {/*    <div className="pt-6 sm:flex">*/}
      {/*      <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">*/}
      {/*        Language*/}
      {/*      </dt>*/}
      {/*      <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">*/}
      {/*        <div className="text-gray-900">English</div>*/}
      {/*        <button*/}
      {/*          type="button"*/}
      {/*          className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*        >*/}
      {/*          Update*/}
      {/*        </button>*/}
      {/*      </dd>*/}
      {/*    </div>*/}
      {/*    <div className="pt-6 sm:flex">*/}
      {/*      <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">*/}
      {/*        Date format*/}
      {/*      </dt>*/}
      {/*      <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">*/}
      {/*        <div className="text-gray-900">DD-MM-YYYY</div>*/}
      {/*        <button*/}
      {/*          type="button"*/}
      {/*          className="font-semibold text-indigo-600 hover:text-indigo-500"*/}
      {/*        >*/}
      {/*          Update*/}
      {/*        </button>*/}
      {/*      </dd>*/}
      {/*    </div>*/}
      {/*  </dl>*/}
      {/*</div>*/}
    </div>
  );
}