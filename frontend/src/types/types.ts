export interface SecondaryCallToActionData {
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface PrimaryCallToActionData {
  title: string;
  description: string;
  descriptionHightlight?: string;
  link1: {
    text: string;
    url: string;
  };
  link2: {
    text: string;
    url: string;
  };
  footer: string;
}
