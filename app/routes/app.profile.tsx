import type { V2_MetaFunction, ActionArgs } from "@remix-run/node";
import { useUser } from "~/utils";
import { Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { UserIcon } from "@heroicons/react/24/solid";
import { updateName, updatePassword } from "~/models/user.server";
import { Notification } from "~/shared";

export const meta: V2_MetaFunction = () => [
  { title: "Your Profile - WagerWire" },
];

export const action = async (args: ActionArgs) => {
  const formData = await args.request.clone().formData();
  const _action = formData.get("_action");

  switch (_action) {
    case "name":
      return modifyUsername(args);
    case "password":
      return modifyPassword(args);
    default:
      return json(
        {
          error: true,
          text: "Feature not implemented yet",
        },
        { status: 400 },
      );
  }
};

const modifyUsername = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const username = formData.get("display_name") as string;
  if (username) {
    const userId = await requireUserId(request);
    await updateName(userId, username);
  } else {
    return json(
      {
        error: true,
        text: "Display name cannot be empty",
      },
      { status: 400 },
    );
  }
  return json(
    {
      error: false,
      text: "Username updated successfully",
    },
    { status: 200 },
  );
};

const modifyPassword = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const oldPass = formData.get("current_password") as string;
  const newPass = formData.get("new_password") as string;
  const confirmPass = formData.get("confirm_password") as string;
  if (!oldPass || !newPass || !confirmPass) {
    return json(
      {
        error: true,
        text: "All password fields are required",
      },
      { status: 400 },
    );
  } else if (newPass !== confirmPass) {
    return json(
      {
        error: true,
        text: "Passwords do not match",
      },
      { status: 400 },
    );
  } else if (!newPass || newPass.length < 8) {
    return json(
      {
        error: true,
        text: "New password must be longer than 8 characters",
      },
      { status: 400 },
    );
  } else {
    const userId = await requireUserId(request);
    await updatePassword(userId, newPass);
    return json(
      {
        error: false,
        text: "Password updated successfully",
      },
      { status: 200 },
    );
  }
};

/**
 * Displays the current user's profile.
 */
export default function Profile() {
  const user = useUser();
  const actionData = useActionData<typeof action>();

  return (
    <div className="divide-y divide-white/5">
      <Notification error={!!actionData?.error} text={actionData?.text} />
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base font-semibold leading-7 text-white">
            Your Profile
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Your image and display name will be visible to all users.
          </p>
        </div>

        <Form className="md:col-span-2" method="POST">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full flex items-center gap-x-8">
              <UserIcon className="h-24 w-24 text-gray-500" />
              {/*<img*/}
              {/*  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"*/}
              {/*  alt=""*/}
              {/*  className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"*/}
              {/*/>*/}
              <div>
                <button
                  type="button"
                  className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                >
                  Change avatar
                </button>
                <p className="mt-2 text-xs leading-5 text-gray-400">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-white"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  disabled
                  placeholder={user.email}
                  className="cursor-not-allowed block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="display-name"
                className="block text-sm font-medium leading-6 text-white"
              >
                Display name
              </label>
              <div className="mt-2">
                <input
                  id="display-name"
                  name="display_name"
                  placeholder={user.name}
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex">
            <button
              type="submit"
              name="_action"
              value="name"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Save
            </button>
          </div>
        </Form>
      </div>

      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base font-semibold leading-7 text-white">
            Change password
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Update your password associated with your account.
          </p>
        </div>

        <Form className="md:col-span-2" method="POST">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium leading-6 text-white"
              >
                Current password
              </label>
              <div className="mt-2">
                <input
                  id="current-password"
                  name="current_password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium leading-6 text-white"
              >
                New password
              </label>
              <div className="mt-2">
                <input
                  id="new-password"
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium leading-6 text-white"
              >
                Confirm password
              </label>
              <div className="mt-2">
                <input
                  id="confirm-password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex">
            <button
              type="submit"
              name="_action"
              value="password"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Save
            </button>
          </div>
        </Form>
      </div>

      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base font-semibold leading-7 text-white">
            Log out other sessions
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Please enter your password to confirm you would like to log out of
            your other sessions across all of your devices.
          </p>
        </div>

        <Form className="md:col-span-2" method="POST">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="logout-password"
                className="block text-sm font-medium leading-6 text-white"
              >
                Your password
              </label>
              <div className="mt-2">
                <input
                  id="logout-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex">
            <button
              type="submit"
              name="_action"
              value="sessions"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Log out other sessions
            </button>
          </div>
        </Form>
      </div>

      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base font-semibold leading-7 text-white">
            Delete account
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            This action is not reversible. All information related to this
            account will be deleted permanently.
          </p>
        </div>

        <Form className="flex items-start md:col-span-2" method="POST">
          <button
            type="submit"
            name="_action"
            value="delete"
            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
          >
            Yes, delete my account
          </button>
        </Form>
      </div>
    </div>
  );
}
