export type AgeGroup = 'baby' | 'kid' | 'teen';
export type ItemAgeGroup = AgeGroup | 'any';
export type PostType = 'giveaway' | 'borrow' | 'exchange' | 'sell' | 'request';
export type ItemStatus = 'available' | 'reserved' | 'taken';
export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  profile_image: string | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age_group: AgeGroup;
  date_of_birth: string | null;
  school: string | null;
  photo: string | null;
  birth_year: number | null;
  birth_month: number | null;
  interests: string[] | null;
  created_at: string;
}

export interface Item {
  id: string;
  owner_id: string;
  post_type: PostType;
  category: string;
  title: string;
  description: string | null;
  age_group: ItemAgeGroup;
  condition: ItemCondition | null;
  location: string | null;
  image_urls: string[];
  price: number | null;
  status: ItemStatus;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  category: string;
  title: string;
  body: string;
  image_urls: string[];
  tags: string[] | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string | null;
  item_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

type Insert<T, AutoKeys extends keyof T> = Omit<T, AutoKeys> & Partial<Pick<T, AutoKeys>>;

type ProfileAuto = 'created_at' | 'updated_at';
type ChildAuto = 'id' | 'created_at';
type ItemAuto = 'id' | 'created_at' | 'status' | 'age_group';
type PostAuto = 'id' | 'created_at';
type CommentAuto = 'id' | 'created_at';
type MessageAuto = 'id' | 'created_at';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insert<Profile, ProfileAuto>;
        Update: Partial<Profile>;
      };
      children: {
        Row: Child;
        Insert: Insert<Child, ChildAuto>;
        Update: Partial<Child>;
      };
      items: {
        Row: Item;
        Insert: Insert<Item, ItemAuto>;
        Update: Partial<Item>;
      };
      community_posts: {
        Row: CommunityPost;
        Insert: Insert<CommunityPost, PostAuto>;
        Update: Partial<CommunityPost>;
      };
      comments: {
        Row: Comment;
        Insert: Insert<Comment, CommentAuto>;
        Update: Partial<Comment>;
      };
      messages: {
        Row: Message;
        Insert: Insert<Message, MessageAuto>;
        Update: Partial<Message>;
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
