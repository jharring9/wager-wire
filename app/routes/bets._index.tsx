import type { V2_MetaFunction, LoaderArgs, ActionArgs } from "@remix-run/node";
import { useUser } from "~/utils";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { getUserBets } from "~/models/bet.server";
import { requireUserId } from "~/session.server";
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { UserIcon } from "@heroicons/react/24/solid";
import { updateName, updatePassword } from "~/models/user.server";
import { Input } from "~/routes/login";
import { Alert } from "~/routes/wager";

export const meta: V2_MetaFunction = () => [
  { title: "WagerWire - Your Profile" },
];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const bets = await getUserBets({ userId });
  if (!bets) {
    throw new Response("User not found", { status: 400 });
  }
  return json(bets);
};

export const action = async (args: ActionArgs) => {
  const formData = await args.request.clone().formData();
  const _action = formData.get("_action");

  switch (_action) {
    case "username":
      return modifyUsername(args);
    case "password":
      return modifyPassword(args);
    default:
      throw redirect("/bets");
  }
};

const modifyUsername = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  if (username) {
    const userId = await requireUserId(request);
    await updateName(userId, username);
  } else {
    return json(
      {
        errors: { username: "Username cannot be empty", password: null },
        success: null,
      },
      { status: 400 },
    );
  }
  return json(
    {
      success: "Username updated successfully",
      errors: null,
    },
    { status: 200 },
  );
};

const modifyPassword = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  if (password && password.length < 8) {
    const userId = await requireUserId(request);
    await updatePassword(userId, password);
  } else {
    return json(
      {
        errors: {
          password: "New password must be longer than 8 characters",
          username: null,
        },
        success: null,
      },
      { status: 400 },
    );
  }

  return json(
    {
      success: "Password updated successfully",
      errors: null,
    },
    { status: 200 },
  );
};

/**
 * Displays the current user's profile, including all of their bets.
 */
export default function YourBetsPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const [displayUserModal, setDisplayUserModal] = useState(false);
  const [displayPasswordModal, setDisplayPasswordModal] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setDisplayPasswordModal(false);
      setDisplayUserModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [actionData]);

  return (
    <div className="mx-auto max-w-2xl space-y-12 sm:space-y-16 lg:mx-0 lg:max-w-none">
      <div>
        <Alert text={actionData?.success} />
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Your Bets
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          See all of your bets for the current season. Click on a bet to open
          the slip.
        </p>

        <div className="flow-root mt-6">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        NFL Week
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Net Profit (Units)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.map((bet, index) => (
                      <tr
                        key={index}
                        onClick={() => navigate(`/bets/me/${bet.week}`)}
                        className="bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center min-w-0 gap-x-4">
                            <p className="text-sm font-semibold leading-6 text-gray-900">
                              {bet.week}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {bet.scoringComplete === true ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <p className="text-sm font-semibold leading-6 text-gray-900">
                            {bet.profit && bet.profit > 0 && "+"}
                            {bet.profit || 0}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Your Information
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Only your display name is publicly available.
        </p>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Display Name
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{user.name}</div>
              <button
                type="button"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
                onClick={() => setDisplayUserModal(true)}
              >
                Update
              </button>
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Password
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">********</div>
              <button
                type="button"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
                onClick={() => setDisplayPasswordModal(true)}
              >
                Update
              </button>
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Email address
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{user.email}</div>
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Season Profit
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{user.totalProfit}</div>
            </dd>
          </div>
        </dl>
      </div>
      <UsernameModal
        name={user.name}
        isOpen={displayUserModal}
        setOpen={setDisplayUserModal}
        error={actionData?.errors?.username}
      />
      <PasswordModal
        isOpen={displayPasswordModal}
        setOpen={setDisplayPasswordModal}
        error={actionData?.errors?.password}
      />
    </div>
  );
}

const UsernameModal = ({ name, isOpen, setOpen, error }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <Form method="POST">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 sm:mx-0 sm:h-10 sm:w-10">
                      <UserIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Edit Your Name
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Any changes will be reflected immediately. This name
                          is displayed publicly.
                        </p>
                      </div>
                      <Input name="username" placeholder={name} error={error} />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      name="_action"
                      value="username"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Submit
                    </button>
                    <button
                      type="reset"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const PasswordModal = ({ isOpen, setOpen, error }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <Form method="POST">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 sm:mx-0 sm:h-10 sm:w-10">
                      <UserIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Edit Your Password
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Any changes will take effect at your next login. Your
                          password is encrypted end-to-end.
                        </p>
                      </div>
                      <Input
                        name="password"
                        type="password"
                        placeholder="New Password"
                        error={error}
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      name="_action"
                      value="password"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Submit
                    </button>
                    <button
                      type="reset"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
