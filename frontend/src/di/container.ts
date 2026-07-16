import { ServiceRepositoryImpl } from '../infrastructure/http/repositories/ServiceRepositoryImpl';
import { ReservationRepositoryImpl } from '../infrastructure/http/repositories/ReservationRepositoryImpl';
import { NewsRepositoryImpl } from '../infrastructure/http/repositories/NewsRepositoryImpl';
import { AuthRepositoryImpl } from '../infrastructure/http/repositories/AuthRepositoryImpl';
import { OrganizationRepositoryImpl } from '../infrastructure/http/repositories/OrganizationRepositoryImpl';
import { ChatbotRepositoryImpl } from '../infrastructure/http/repositories/ChatbotRepositoryImpl';
import { UploadRepositoryImpl } from '../infrastructure/http/repositories/UploadRepositoryImpl';
import { TouristicAttractionRepositoryImpl } from '../infrastructure/http/repositories/TouristicAttractionRepositoryImpl';
import { AuditRepositoryImpl } from '../infrastructure/http/repositories/AuditRepositoryImpl';
import { ContactRepositoryImpl } from '../infrastructure/http/repositories/ContactRepositoryImpl';
import { ReviewRepositoryImpl } from '../infrastructure/http/repositories/ReviewRepositoryImpl';
import { RoleRepositoryImpl } from '../infrastructure/http/repositories/RoleRepositoryImpl';

import { TokenStorageImpl } from '../infrastructure/storage/TokenStorageImpl';
import { CookieConsentStorageImpl } from '../infrastructure/storage/CookieConsentStorageImpl';

import { ServiceUseCases } from '../application/services/ServiceUseCases';
import { ReservationUseCases } from '../application/services/ReservationUseCases';
import { NewsUseCases } from '../application/services/NewsUseCases';
import { AuthUseCases } from '../application/services/AuthUseCases';
import { OrganizationUseCases } from '../application/services/OrganizationUseCases';
import { ChatbotUseCases } from '../application/services/ChatbotUseCases';
import { UploadUseCases } from '../application/services/UploadUseCases';
import { TouristicAttractionUseCases } from '../application/services/TouristicAttractionUseCases';
import { AuditUseCases } from '../application/services/AuditUseCases';
import { ContactUseCases } from '../application/services/ContactUseCases';
import { ReviewUseCases } from '../application/services/ReviewUseCases';
import { RoleUseCases } from '../application/services/RoleUseCases';

const serviceRepo = new ServiceRepositoryImpl();
const reservationRepo = new ReservationRepositoryImpl();
const newsRepo = new NewsRepositoryImpl();
const authRepo = new AuthRepositoryImpl();
const organizationRepo = new OrganizationRepositoryImpl();
const chatbotRepo = new ChatbotRepositoryImpl();
const uploadRepo = new UploadRepositoryImpl();
const attractionRepo = new TouristicAttractionRepositoryImpl();
const auditRepo = new AuditRepositoryImpl();
const contactRepo = new ContactRepositoryImpl();
const reviewRepo = new ReviewRepositoryImpl();
const roleRepo = new RoleRepositoryImpl();

const tokenStorage = new TokenStorageImpl();

export const container = {
  services: new ServiceUseCases(serviceRepo),
  reservations: new ReservationUseCases(reservationRepo),
  news: new NewsUseCases(newsRepo),
  auth: new AuthUseCases(authRepo, tokenStorage),
  organization: new OrganizationUseCases(organizationRepo),
  chatbot: new ChatbotUseCases(chatbotRepo),
  upload: new UploadUseCases(uploadRepo),
  attractions: new TouristicAttractionUseCases(attractionRepo),
  audit: new AuditUseCases(auditRepo),
  contact: new ContactUseCases(contactRepo),
  reviews: new ReviewUseCases(reviewRepo),
  roles: new RoleUseCases(roleRepo),
  cookieConsentStorage: new CookieConsentStorageImpl(),
};
