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

export function subscribeToFeed(feed: Topic | Interest, type: 'topic' | 'interest') {
  if (typeof window === 'undefined') {
    return;
  }
  if (type === 'topic') {
    const currentTopics = getSubscribedTopics();
    if (!currentTopics.some(t => t.name === feed.name)) {
      setSubscribedTopics([...currentTopics, feed as Topic]);
    }
  } else if (type === 'interest') {
    const currentInterests = getSubscribedInterests();
    if (!currentInterests.some(i => i.name === feed.name)) {
      setSubscribedInterests([...currentInterests, feed as Interest]);
    }
  }
}

export function unsubscribeFromFeed(feedName: string, type: 'topic' | 'interest') {
  if (typeof window === 'undefined') {
    return;
  }
  if (type === 'topic') {
    const currentTopics = getSubscribedTopics();
    setSubscribedTopics(currentTopics.filter(t => t.name !== feedName));
  } else if (type === 'interest') {
    const currentInterests = getSubscribedInterests();
    setSubscribedInterests(currentInterests.filter(i => i.name !== feedName));
  }
}
