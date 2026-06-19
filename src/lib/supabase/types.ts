export type BlogRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type PostRow = {
  id: string;
  blog_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_html: string | null;
  hero_image_url: string | null;
  author: string | null;
  status: "draft" | "published";
  published_at: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DevotionalRow = {
  id: string;
  slug: string;
  title: string;
  scripture: string | null;
  excerpt: string | null;
  body_html: string | null;
  image_url: string | null;
  cal_month: number | null;
  cal_day: number | null;
  status: "draft" | "published";
  published_at: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  facebook_event_url: string | null;
  image_url: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

export type SubscriberRow = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
};
