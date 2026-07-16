export interface ICookieConsentStorage {
  isAccepted(): boolean;
  accept(): void;
}
