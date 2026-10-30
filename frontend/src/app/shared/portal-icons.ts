import { inject } from '@angular/core';
import { NzIconService } from 'ng-zorro-antd/icon';
import {
  ArrowLeftOutline,
  BankOutline,
  BarChartOutline,
  BellOutline,
  CarryOutOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  CloudUploadOutline,
  DownloadOutline,
  FileTextOutline,
  GiftOutline,
  IdcardOutline,
  LinkOutline,
  LockOutline,
  LogoutOutline,
  MenuOutline,
  PictureOutline,
  QuestionCircleFill,
  RightOutline,
  SendOutline,
  TagOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

/**
 * Registra os ícones do portal no serviço global do NG-ZORRO, sem buscar SVG pela rede.
 * Chamada no construtor dos layouts: roda antes das diretivas do conteúdo projetado e
 * mantém os ícones fora do bundle inicial do login.
 */
export function registerPortalIcons(): void {
  inject(NzIconService).addIcon(
    ArrowLeftOutline,
    BankOutline,
    BarChartOutline,
    BellOutline,
    CarryOutOutline,
    CheckCircleOutline,
    ClockCircleOutline,
    CloudUploadOutline,
    DownloadOutline,
    FileTextOutline,
    GiftOutline,
    IdcardOutline,
    LinkOutline,
    LockOutline,
    LogoutOutline,
    MenuOutline,
    PictureOutline,
    QuestionCircleFill,
    RightOutline,
    SendOutline,
    TagOutline,
    UserOutline,
  );
}
