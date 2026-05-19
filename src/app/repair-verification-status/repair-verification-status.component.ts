import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

enum COLS {
  EDIT = 0,
  OTHER_OFFICER = 1,
  OFFICER_AFTER_24HRS = 2,
  J = 5,
  CURRENT_STATUS = 3,
  DAYS_SINCE_CVIR_STARTED = 4,
  VERIFICATION_STATUS = 6
}

@Component({
  standalone: true,
  templateUrl: './repair-verification-status.component.html',
  styleUrl: './repair-verification-status.component.scss',
  imports: [FormsModule, ReactiveFormsModule]
})
export class RepairVerificationStatusComponent {
  @ViewChildren('ddl') ddlMenu!: QueryList<ElementRef>;

  cols: { name: string; ddl: any[]; lst: any[] }[] = [
    { name: 'isEdit', ddl: [true, false], lst: [] },
    { name: 'isOtherOfficer', ddl: [true, false], lst: [] },
    { name: 'isOfficerAfter24Hrs', ddl: [true, false], lst: [] },
    { name: 'currentStatus', ddl: ['OVERDUE', '~OVERDUE'], lst: [] },
    { name: 'daysSinceCvirStarted', ddl: [1, 15], lst: [] },
    { name: 'Repair Verification Status', ddl: [0, 1, 2], lst: [] },
    { name: 'Repair Verification Status (control)', ddl: ['Pending', 'Not Received', 'Received'], lst: [] }
  ].map(c => ({ ...c, lst: [...c.ddl] }));

  private allTbl: any[] = this.cols[COLS.EDIT].ddl.flatMap(a =>
    this.cols[COLS.OTHER_OFFICER].ddl.flatMap(b =>
      this.cols[COLS.OFFICER_AFTER_24HRS].ddl.flatMap(c =>
        this.cols[COLS.J].ddl.flatMap(d =>
          this.cols[COLS.CURRENT_STATUS].ddl.flatMap(e =>
            this.cols[COLS.DAYS_SINCE_CVIR_STARTED].ddl.flatMap(f =>
              this.cols[COLS.VERIFICATION_STATUS].ddl.map(g => {
                return {
                  isEdit: a,
                  isOtherOfficer: b,
                  isOfficerAfter24Hrs: c,
                  j: d,
                  currentStatus: e,
                  daysSinceCvirStarted: f,
                  verificationStatus: g,
                  ctrlDisabled: null
                };
              })
            )
          )
        )
      )
    )
  );

  tfTbl: any[] = [];

  #curMenu: any;

  constructor() {
    this.#getTbl();
  }

  toggleFilter(menu: any) {
    if (menu.classList.contains('show')) {
      menu.classList.remove('show');
    } else {
      menu.classList.add('show');
      this.#curMenu = menu;
    }
  }

  check(val: any, col: (typeof this.cols)[0], tgt: EventTarget | null) {
    if ((tgt as HTMLInputElement)?.checked) {
      col.lst.push(val);
    } else {
      col.lst = col.lst.filter(f => f !== val);
    }
    this.#getTbl();
  }

  #logic4notreceived = ({
    isEdit,
    isOtherOfficer,
    isOfficerAfter24Hrs,
    j,
    currentStatus,
    daysSinceCvirStarted,
    verificationStatus
  }: (typeof this.allTbl)[0]) => {
    return (isEdit &&
      (isOtherOfficer || isOfficerAfter24Hrs) &&
      !(j < 2 && currentStatus === 'OVERDUE' && daysSinceCvirStarted >= 15) &&
      verificationStatus !== 'Not Received') ||
      (!(currentStatus === 'OVERDUE' && daysSinceCvirStarted >= 15) && verificationStatus === 'Not Received')
      ? true
      : null;
  };

  #getTbl() {
    this.tfTbl = this.allTbl
      .filter(
        r =>
          this.cols[COLS.EDIT].lst.includes(r.isEdit) &&
          this.cols[COLS.OTHER_OFFICER].lst.includes(r.isOtherOfficer) &&
          this.cols[COLS.OFFICER_AFTER_24HRS].lst.includes(r.isOfficerAfter24Hrs) &&
          this.cols[COLS.J].lst.includes(r.j) &&
          this.cols[COLS.CURRENT_STATUS].lst.includes(r.currentStatus) &&
          this.cols[COLS.DAYS_SINCE_CVIR_STARTED].lst.includes(r.daysSinceCvirStarted) &&
          this.cols[COLS.VERIFICATION_STATUS].lst.includes(r.verificationStatus)
      )
      .map(r => {
        r.ctrlDisabled = this.#logic4notreceived(r);
        return r;
      });
  }

  @HostListener('window:mousedown', ['$event'])
  protected handleEvent(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.#curMenu) {
      this.#curMenu.classList.remove('show');
    }
  }
}
