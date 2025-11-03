import { Icon } from "@iconify/react";
import type { RefObject } from "preact";
import { useEffect, useLayoutEffect, useRef } from "preact/hooks";

import { useInfiniteGetClients } from "@/api/http/v1/clients/clients.hooks";
import type { ClientAttributes, ClientData } from "@/api/http/v1/clients/clients.types";
import { useGetUserProfile } from "@/api/http/v1/users/users.hooks";
import { headerContentSignal, selectingSignal } from "@/layout/Header";
import { ClientSkeleton } from "./components/ClientSkeleton";

export const Clients = () => {
  const getUserProfile = useGetUserProfile();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteGetClients();

  // Flatten all pages into a single array of clients
  const allClients = data?.pages.flatMap((page) => page.data) ?? [];

  useLayoutEffect(() => {
    selectingSignal.value = {
      isSelecting: false,
      selectedItems: [],
    };
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: () => <h1 class="text-3xl text-black">Clients</h1>,
      tab: "clients",
      headerContent: () => (
        <>
          <a href="/gallery" class="relative min-h-5 min-w-5 p-1">
            <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
          </a>
          <a href="/gallery/folders">
            <li class="relative min-h-5 min-w-5 p-1">
              <Icon icon="bi:folder" className="h-4 w-4 text-black" />
              <p class="-top-0.5 -right-0.5 absolute grid min-h-3.5 min-w-3.5 place-content-center rounded-full bg-primary text-[0.625rem] text-white leading-0">
                {getUserProfile.data?.data.user.total_folders || 0}
              </p>
            </li>
          </a>
        </>
      ),
    };
  }, []);

  return (
    <div class="flex flex-1 flex-col gap-10 px-4 pb-24">
      {!isLoading && allClients.length === 0 && <NoClients />}

      {!isLoading && allClients.length > 0 && (
        <ThereAreClients clients={allClients} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} />
      )}

      {isLoading && Array.from({ length: 5 }).map((_, index) => <ClientSkeleton key={index} />)}
    </div>
  );
};

const NoClients = () => {
  return (
    <div class="flex flex-1 flex-col items-stretch">
      <div class="flex flex-1 flex-col items-center justify-center gap-4">
        <div class="flex flex-col items-center gap-4">
          <h2 class="text-2xl leading-0">No saved clients</h2>
          <p class="max-w-8/10 text-center font-medium text-grey-500 text-sm">Save your clients info here by clicking on the button below</p>
        </div>
        <a class="flex items-center gap-2 py-2" href="/clients/add">
          <p class="font-medium text-sm">Add Client</p>
          <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
        </a>
      </div>
    </div>
  );
};

const ThereAreClients = (props: { clients: ClientData[]; hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => void }) => {
  return (
    <div class="flex flex-col gap-6">
      <ul class="flex items-center justify-between gap-4">
        <a class="flex items-center gap-2 py-2" href="/clients/add">
          <p class="font-medium text-sm">Add Client</p>
          <i class="min-h-5 min-w-5">
            <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
          </i>
        </a>
        <a class="flex items-center gap-1 bg-secondary px-2 py-1" href="/clients/orders">
          <p class="font-medium text-sm">View Orders</p>
          <i class="min-h-5 min-w-5">
            <Icon icon="fluent:clothes-hanger-20-filled" className="h-5 w-5 text-black" />
          </i>
        </a>
      </ul>
      <ClientList clients={props.clients} hasNextPage={props.hasNextPage} isFetchingNextPage={props.isFetchingNextPage} fetchNextPage={props.fetchNextPage} />
    </div>
  );
};

const ClientList = (props: { clients: ClientData[]; hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => void }) => {
  const observerTarget = useRef<HTMLAnchorElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && props.hasNextPage && !props.isFetchingNextPage) {
          props.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [props.hasNextPage, props.isFetchingNextPage, props.fetchNextPage]);

  // Group clients by first letter of first name
  const groupedClients = props.clients.reduce(
    (acc, client) => {
      const firstLetter = client.attributes.first_name[0]?.toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(client.attributes);
      return acc;
    },
    {} as Record<string, ClientAttributes[]>
  );

  // Sort the letters alphabetically
  const sortedLetters = Object.keys(groupedClients).sort();

  // Get the last client to attach the observer
  const lastClient = props.clients[props.clients.length - 1];

  return (
    <div class="flex flex-col gap-4">
      {sortedLetters.map((letter) => (
        <div key={letter} class="flex flex-col gap-4">
          <div class="border-b border-b-line px-3">
            <h2 class="text-2xl">{letter}</h2>
          </div>
          <ul class="flex flex-col gap-3.5">
            {groupedClients[letter].map((client) => {
              const isLastItem = client.id === lastClient.attributes.id;
              return <ClientListItem key={client.id} client={client} isLastItem={isLastItem} observerRef={isLastItem ? observerTarget : undefined} />;
            })}
          </ul>
        </div>
      ))}
      {props.isFetchingNextPage && (
        <div class="flex flex-col gap-2">
          <ClientSkeleton />
        </div>
      )}
    </div>
  );
};

const ClientListItem = (props: { client: ClientAttributes; isLastItem: boolean; observerRef?: RefObject<HTMLAnchorElement> }) => {
  return (
    <a href={`/clients/${props.client.id}`} class="flex items-center gap-3.5" ref={props.isLastItem ? props.observerRef : null}>
      <p class="grid size-8 place-content-center bg-secondary px-2 py-2.5 text-black">{props.client.first_name[0]}</p>
      <div class="flex h-10 flex-1 items-center border-b border-b-line text-base">{props.client.full_name}</div>
    </a>
  );
};
