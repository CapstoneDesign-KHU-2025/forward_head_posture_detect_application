"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useMemo } from "react";
import { Button } from "@/components/Button";
import { BrandLink } from "@/app/[locale]/components/header/BrandLink";
import { useSession, signIn } from "next-auth/react";
/* import { FriendsButton } from "@/components/molecules/FriendsButton"; */
import { UserButton } from "@/app/[locale]/components/header/UserButton";
/* import { FriendsModal } from "@/components/organisms/friends/FriendsModal"; */
//import { useFriendsData } from "@/hooks/useFriendsData";
import { useTranslations } from "next-intl";
import LanguageToggle from "@/app/[locale]/components/header/LanguageToggle";
import { SoundButton } from "@/app/[locale]/components/header/SoundButton";
import { tv } from "tailwind-variants";


const headerStyles = tv({
  slots: {
    header:
      "fixed top-0 left-0 right-0 z-50 w-full bg-[var(--green-pale)]",

    inner: "w-full px-6 md:px-8",

    landingLayout:
      "flex h-[var(--header-height)] w-full items-center justify-between",

    defaultLayout:
      "relative flex h-[var(--header-height)] w-full items-center justify-between",

    nav:
      "absolute left-1/2 flex -translate-x-1/2 items-center gap-1",

    rightActions: "flex items-center gap-2",

    turtleIcon: "shrink-0 object-contain",

    navLink:
      "rounded-[10px] px-4 py-[7px] text-base font-semibold no-underline transition-colors duration-150",
  },

  variants: {
    active: {
      true: {
        navLink: "bg-[var(--green-light)] text-[var(--green)]",
      },
      false: {
        navLink:
          "text-[var(--text-sub)] hover:bg-[var(--green-light)] hover:text-[var(--green)]",
      },
    },
  },

  defaultVariants: {
    active: false,
  },
});

const {
  header,
  inner,
  landingLayout,
  defaultLayout,
  nav,
  rightActions,
  turtleIcon,
  navLink,
} = headerStyles();

type UserActionsProps = {
  isLoading: boolean;
  user: { name?: string | null; email?: string; image?: string; avatarSrc?: string } | null;
};

function UserActions({ isLoading, user }: UserActionsProps) {
  const t = useTranslations("Header");

  if (isLoading) return <span className="text-sm text-black/40">...</span>;

  if (!user) return <Button onClick={() => signIn()}>{t("login_button")}</Button>;

  return (
    <>
      {/* <FriendsButton requestCount={friendsData?.incomingCount || 0} onClick={() => setIsFriendsModalOpen(true)} /> */}
      <SoundButton />
      <UserButton
        user={{
          name: user.name ?? t("UserButton.name"),
          email: (user as any)?.email,
          image: (user as any)?.image,
          avatarSrc: (user as any)?.avatarSrc,
        }}
      />
      {/*    <FriendsModal
          isOpen={isFriendsModalOpen}
          onClose={() => setIsFriendsModalOpen(false)}
          friendsData={friendsData || undefined}
        /> */}
    </>
  );
}

type HeaderProps = {
  user?: { name: string; avatarSrc?: string } | null;
  className?: string;
};

export default function Header({ user: initialUser, className }: HeaderProps) {
  const t = useTranslations("Header");
  const t_basic = useTranslations("Basic");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  // const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  //const friendsData = useFriendsData();

  const navItems = useMemo(() => [
    { label: t("navItems.home"), href: "/" },
    { label: t("navItems.estimate"), href: "/estimate" },
  ], [t]);

  const isLoading = status === "loading";
  const user = session?.user ?? initialUser ?? null;
  const isLandingPage = pathname === "/landing";
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";

  if (isLoginPage || isCharacterPage) return null;

  return (
    <header className={header({ class: className })}>
      <div className={inner()}>
        {isLandingPage ? (
          <div className={landingLayout()}>
            <BrandLink
              icon={<img src="/icons/turtle.png" alt="" className={turtleIcon()} />}
              label={t_basic("title")}
            />
            <div className={rightActions()}>
              <LanguageToggle />
              <UserActions isLoading={isLoading} user={user as any} />
            </div>
          </div>
        ) : (
          <div className={defaultLayout()}>
            {/* Left: Logo & brand */}
            <BrandLink
              icon={<img src="/icons/turtle.png" alt="" className={turtleIcon()} />}
              label={t_basic("title")}
            />

            {/* Center */}
            <nav className={nav()}>
              {navItems.map((item) => {
                const isActive = (pathname ?? "/") === item.href;
                return (
                  <Link key={item.href} href={item.href} className={navLink({ active: isActive })}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className={rightActions()}>
              <LanguageToggle />
              <UserActions isLoading={isLoading} user={user as any} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
