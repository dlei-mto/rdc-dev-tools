import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    { name: 'verificationStatus', ddl: ['Not Received', 'Pending or Received'], lst: [] },
    { name: 'control of Repair Verification Status', ddl: [0, 1, 2], lst: [] }
  ].map(c => ({ ...c, lst: [...c.ddl] }));

  private allTbl: any[] = this.cols[0].ddl.flatMap(a =>
    this.cols[1].ddl.flatMap(b =>
      this.cols[2].ddl.flatMap(c =>
        this.cols[6].ddl.flatMap(d =>
          this.cols[3].ddl.flatMap(e =>
            this.cols[4].ddl.flatMap(f =>
              this.cols[5].ddl.map(g => {
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
          this.cols[0].lst.includes(r.isEdit) &&
          this.cols[1].lst.includes(r.isOtherOfficer) &&
          this.cols[2].lst.includes(r.isOfficerAfter24Hrs) &&
          this.cols[6].lst.includes(r.j) &&
          this.cols[3].lst.includes(r.currentStatus) &&
          this.cols[4].lst.includes(r.daysSinceCvirStarted) &&
          this.cols[5].lst.includes(r.verificationStatus)
      )
      .map(r => {
        r.ctrlDisabled = this.#logic4notreceived(r);
        return r;
      });
  }

  @HostListener('window:mousedown', ['$event'])
  private handleEvent(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.#curMenu) {
      this.#curMenu.classList.remove('show');
    }
  }
}
