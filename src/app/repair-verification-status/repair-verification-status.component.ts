import { Component, computed, DestroyRef, ElementRef, HostListener, inject, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';

enum COLS {
  EDIT = 0,
  OTHER_OFFICER = 1,
  OFFICER_AFTER_24HRS = 2,
  CURRENT_STATUS = 3,
  DAYS_SINCE_CVIR_STARTED = 4,
  VERIFICATION_STATUS = 5
}

@Component({
  standalone: true,
  templateUrl: './repair-verification-status.component.html',
  styleUrl: './repair-verification-status.component.scss',
  imports: [FormsModule, ReactiveFormsModule]
})
export class RepairVerificationStatusComponent implements OnInit {
  @ViewChildren('ddl') ddlMenu!: QueryList<ElementRef>;

  cols: { name: string; ddl: any[]; lst: any[] }[] = [
    { name: 'isEdit', ddl: [true, false], lst: [] },
    { name: 'isOtherOfficer', ddl: [true, false], lst: [] },
    { name: 'isOfficerAfter24Hrs', ddl: [true, false], lst: [] },
    { name: 'currentStatus', ddl: ['OVERDUE', 'not OVERDUE'], lst: [] },
    { name: 'daysSinceCvirStarted', ddl: [1, 15], lst: [] },
    { name: 'Repair Verification Status', ddl: ['0:Pending', '1:Not Received', '2:Received'], lst: [] }
  ].map(c => ({ ...c, lst: [...c.ddl] }));

  private allTbl: any[] = this.cols[COLS.EDIT].ddl.flatMap(a =>
    this.cols[COLS.OTHER_OFFICER].ddl.flatMap(b =>
      this.cols[COLS.OFFICER_AFTER_24HRS].ddl.flatMap(c =>
        this.cols[COLS.CURRENT_STATUS].ddl.flatMap(e =>
          this.cols[COLS.DAYS_SINCE_CVIR_STARTED].ddl.flatMap(f =>
            this.cols[COLS.VERIFICATION_STATUS].ddl.map(g => {
              return {
                isEdit: a,
                isOtherOfficer: b,
                isOfficerAfter24Hrs: c,
                j: +g.split(':')[0],
                currentStatus: e,
                daysSinceCvirStarted: f,
                verificationStatus: g.split(':')[1],
                ctrlDisabled: null
              };
            })
          )
        )
      )
    )
  );

  tfTbl: any[] = [];

  #curMenu: any;

  fm = new FormGroup({
    isCreator: new FormControl(),
    isCepoAdmin: new FormControl(),
    isDistrictAdmin: new FormControl(),
    isMTOAdmin: new FormControl(),
    allCvir: new FormControl(),
    modificationType: new FormControl() // lessThan24hrs,greaterThan24hrs
  });

  #destroy = inject(DestroyRef);

  profile = signal({ isCreator: true, isCepoAdmin: false, isDistrictAdmin: false, isMTOAdmin: false, permissions: [] as string[] });
  ctx = signal({ modificationType: '', currentStatus: '' });
  state = computed(() => {
    const pro = this.profile();
    const isDistrictAdmin = pro?.isDistrictAdmin && !pro?.isCepoAdmin;
    const userRole = pro?.isMTOAdmin === true || isDistrictAdmin ? 'Administrator' : 'Officer';
    const isAdmin = userRole === 'Administrator' ? true : false;
    const isSuperAdmin = userRole === 'Administrator' && pro?.permissions?.includes('review.allCvir');

    const ctx = this.ctx();
    const modificationType: string = ctx.modificationType; // greaterThan24hrs
    const currentStatus: string = ctx.currentStatus;

    // RDC logic
    const checkIfIsOtherOfficer = (): boolean => {
      let isOtherOfficer: boolean = !this.profile().isCreator; // this.cvirObject?.cvirHeader?.inspector?.badgeNumber !== this.badgeId ? true : false;
      isOtherOfficer = userRole === 'Administrator' ? false : isOtherOfficer && userRole === 'Officer';
      return isOtherOfficer;
    };
    const checkIfOfficerAfter24Hrs = (): boolean => {
      let isOfficerWhoCreatedCvir = pro.isCreator && userRole === 'Officer'; // this.cvirObject?.cvirHeader?.inspector?.badgeNumber === this.badgeId && this.userRole === 'Officer' ? true : false;
      let officerAllowMod2 =
        modificationType === 'greaterThan24hrs' && // this.cvir?.cvirInspection?.createTime
        currentStatus !== 'REJECTED' &&
        !isAdmin &&
        isOfficerWhoCreatedCvir;
      return officerAllowMod2;
    };

    const isOtherOfficer = checkIfIsOtherOfficer();
    const isOfficerAfter24Hrs = checkIfOfficerAfter24Hrs();

    this.#getTbl();

    return { isDistrictAdmin, userRole, isAdmin, isSuperAdmin, modificationType, currentStatus, isOtherOfficer, isOfficerAfter24Hrs };
  });

  ngOnInit(): void {
    this.fm.valueChanges.pipe(startWith(this.fm.value), takeUntilDestroyed(this.#destroy)).subscribe(val => {
      this.profile.update(user => ({
        ...user,
        isCreator: val.isCreator,
        isCepoAdmin: val.isCepoAdmin,
        isDistrictAdmin: val.isDistrictAdmin,
        isMTOAdmin: val.isMTOAdmin,
        permissions: val.allCvir ? ['review.allCvir'] : []
      }));
      this.ctx.update(c => ({ ...c, modificationType: val.modificationType }));
      // this.#getTbl();
    });
    this.fm.patchValue({ isCreator: true, isCepoAdmin: false, isDistrictAdmin: false, isMTOAdmin: false, allCvir: false });
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
          this.cols[COLS.CURRENT_STATUS].lst.includes(r.currentStatus) &&
          this.cols[COLS.DAYS_SINCE_CVIR_STARTED].lst.includes(r.daysSinceCvirStarted) &&
          this.cols[COLS.VERIFICATION_STATUS].lst.find(v => v.split(':')[1] === r.verificationStatus)
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
