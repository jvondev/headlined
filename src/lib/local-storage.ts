import { Topic, Interest } from "@/types";

export function getSubscribedTopics(): Topic[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const subscribedTopics = localStorage.getItem('subscribedTopics');
  return subscribedTopics ? JSON.parse(subscribedTopics) : [];
}

export function setSubscribedTopics(topics: Topic[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('subscribedTopics', JSON.stringify(topics));
}

export function getSubscribedInterests(): Interest[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const subscribedInterests = localStorage.getItem('subscribedInterests');
  return subscribedInterests ? JSON.parse(subscribedInterests) : [];
}

export function setSubscribedInterests(interests: Interest[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('subscribedInterests', JSON.stringify(interests));
}
