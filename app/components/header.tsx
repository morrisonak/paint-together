import { SignOutButton, SignInButton } from "@clerk/remix";
import { Link } from "@remix-run/react";
import { Authenticated, Unauthenticated } from "convex/react";

export function Header() {
  return (
    <div className="bg-gray-950">
      <div className="container flex items-center justify-between p-4 mx-auto">
        <div>My App</div>

        <div className="flex gap-8">
          <Link className="hover:text-blue-300" to={"/"}>
            Browse
          </Link>
          <Link className="hover:text-blue-300" to={"/generate"}>
            Generate
          </Link>
          <Link className="hover:text-blue-300" to={"/rooms"}>
            Collection
          </Link>
        </div>

        <div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal" />
          </Unauthenticated>
        </div>
      </div>
    </div>
  );
}
