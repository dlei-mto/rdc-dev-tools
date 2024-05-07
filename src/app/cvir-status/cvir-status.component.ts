import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { startWith, tap } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './cvir-status.component.html',
  styleUrls: ['./cvir-status.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class CvirStatusComponent implements OnInit {
  #statusNewCvirId = 'REVIEW';
  #statusAcceptedId = 'ACCEPTED';
  #statusOverdueId = 'OVERDUE';
  #statusRejectedId = 'REJECTED';
  prevCvirStatuses = [this.#statusNewCvirId, this.#statusAcceptedId, this.#statusOverdueId, this.#statusRejectedId, 'OTHER'];

  #RepairVerificationStatusOptions = [
    {
      id: 9691,
      languageCode: null,
      code: '1',
      name: 'Pending',
      desc: 'Verification of repairs for a vehicle inspection defect is required and has not been received',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-04-05T00:00:00.000-04:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    },
    {
      id: 9692,
      languageCode: null,
      code: '2',
      name: 'Not Received',
      desc: 'The time period for supplying proof of repairs for a vehicle inspection defect has passed and proof of repairs has not been received',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-04-05T00:00:00.000-04:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    },
    {
      id: 9693,
      languageCode: null,
      code: '3',
      name: 'Received',
      desc: 'Proof of verification of repairs for a defect has been received',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-04-05T00:00:00.000-04:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    }
  ];
  #receivedStatusId = this.#RepairVerificationStatusOptions?.find(x => {
    return x?.code === '3';
  })?.id;
  #notReceivedStatusId = this.#RepairVerificationStatusOptions?.find(x => {
    return x?.code === '2';
  })?.id;
  #pendingReceivedStatusId = this.#RepairVerificationStatusOptions?.find(x => {
    return x?.code === '1';
  })?.id;

  // cvorNscTypes = ["Not (NotRegistered/Exempt)", "NotRegistered/Exempt"];
  cvorNscList = [
    {
      id: 9789,
      languageCode: null,
      code: 'YES-NUMBER',
      name: 'Yes',
      desc: 'A CVOR type vehicle that has a CVOR number',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-03-08T00:00:00.000-05:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    },
    {
      id: 9790,
      languageCode: null,
      code: 'YES-NO-NUMBER',
      name: 'Yes, Not Registered',
      desc: 'A CVOR type vehicle that requires a CVOR number but does not have one',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-03-08T00:00:00.000-05:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    },
    {
      id: 9791,
      languageCode: null,
      code: 'YES-NOT-REQUIRED',
      name: 'Yes, Exempt',
      desc: 'A CVOR type vehicle that is exempt from having a CVOR number because of the way it is being used',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-03-08T00:00:00.000-05:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    },
    {
      id: 9792,
      languageCode: null,
      code: 'NO-NOT-REQUIRED',
      name: 'No',
      desc: 'Not a  CVOR type vehicle',
      frCode: null,
      frName: null,
      frDesc: null,
      effectiveDate: '2005-03-08T00:00:00.000-05:00',
      endDate: null,
      extraInfo: null,
      impoundmentFlag: false,
      outOfService: false,
      history: null,
      alias: null,
      translation: null
    }
  ];

  // conditions
  modes = ['online', 'offline'];
  types = ['New', 'Modify'];
  roles = ['Administrator', 'Officer'];
  rvs = ['RV', 'no RV'];
  rvStatuses = this.#RepairVerificationStatusOptions;
  modificationTypes = ['lessThan24hrs', 'greaterThan24hrs'];
  inspectionLevels = ['<=4', '5'];

  // previous CVIR object
  cvirObject = {
    cvirStatus: '---',
    cvirVehicles: [{ cvorTypeVehicle: 0 }]
  } as any;

  // current CVIR object
  cvir = {
    cvirStatus: '---',
    cvirDriver: {
      driverLicenceNotAvailable: false
    },
    cvirVehicles: [{}] as any[]
  };

  // output
  outputTable: any[] = [];

  //
  #trackInputPopulation: {
    cvorNsc: { populated: boolean; data: any };
    driverLicense: { populated: boolean; data: any };
    plates: { populated: boolean; data: any }[];
  } = {
    cvorNsc: { populated: false, data: null },
    driverLicense: { populated: false, data: null },
    plates: [
      { populated: false, data: null },
      { populated: false, data: null },
      { populated: false, data: null },
      { populated: false, data: null }
    ]
  };

  #isEdit = true;
  #modificationType = '';
  #selectedVerificationStatusId = this.#RepairVerificationStatusOptions[0].id;

  fm = new FormGroup({
    mode: new FormControl(this.modes[0]),
    type: new FormControl(this.types[0]),
    role: new FormControl(this.roles[1]),
    rv: new FormControl(this.rvs[0]),
    rvStatus: new FormControl(`${this.rvStatuses[0].id}`),
    modificationType: new FormControl(this.modificationTypes[0]),
    selectedLevel: new FormControl(this.inspectionLevels[0]),
    cvorNscType: new FormControl(`${this.cvorNscList[0].id}`),
    cvorNscTypeChanged: new FormControl(false),
    cvorNscPopulated: new FormControl(true),
    driverLicensePopulated: new FormControl(true),
    plate1Populated: new FormControl(true),
    plate2Populated: new FormControl(true),
    plate3Populated: new FormControl(true),
    plate4Populated: new FormControl(true),
    prevCvirStatus: new FormControl('OTHER')
  });

  get selectedLevel() {
    return this.fm.controls.selectedLevel.value;
  }

  #auth = {
    isOnlineMode: () => this.fm.controls.mode.value === this.modes[0]
  };

  get userRole() {
    return this.fm.controls.role.value;
  }

  checkIfHasRepairVerification() {
    return this.fm.controls.rv.value === this.rvs[0];
  }

  ngOnInit(): void {
    // const cvir = this.cvir;

    this.fm.valueChanges
      .pipe(
        startWith(this.fm.value),
        tap(v => {
          console.log(v);

          this.#isEdit = v.type === this.types[1];
          this.cvirObject.cvirStatus = !this.#isEdit ? '---' : this.fm.controls.prevCvirStatus.value;

          this.#trackInputPopulation.cvorNsc.populated = !!this.fm.controls.cvorNscPopulated.value;
          this.#trackInputPopulation.driverLicense.populated = !!this.fm.controls.driverLicensePopulated.value;
          this.#trackInputPopulation.plates[0].populated = !!this.fm.controls.plate1Populated.value;
          this.#trackInputPopulation.plates[1].populated = !!this.fm.controls.plate2Populated.value;
          this.#trackInputPopulation.plates[2].populated = !!this.fm.controls.plate3Populated.value;
          this.#trackInputPopulation.plates[3].populated = !!this.fm.controls.plate4Populated.value;

          this.outputTable = [];
          this.rvs.forEach(rv => {
            this.rvStatuses.forEach(rvStatus => {
              this.modificationTypes.forEach(modificationType => {
                this.cvorNscList.forEach(cvorNscType => {
                  const oldrv = this.fm.controls.rv.value;
                  this.fm.controls.rv.patchValue(rv, {
                    onlySelf: true,
                    emitEvent: false
                  });
                  this.#selectedVerificationStatusId = rvStatus.id;
                  this.#modificationType = modificationType;
                  this.cvir.cvirVehicles[0].cvorTypeVehicle = cvorNscType.id;
                  this.cvirObject.cvirVehicles[0].cvorTypeVehicle = this.fm.controls.cvorNscTypeChanged.value ? 0 : this.cvir.cvirVehicles[0].cvorTypeVehicle;

                  this.#decideCvirStatus(this.cvir);
                  this.fm.controls.rv.patchValue(oldrv, {
                    onlySelf: true,
                    emitEvent: false
                  });

                  this.outputTable.push([
                    rv === oldrv &&
                      (!this.#isEdit || rv !== this.rvs[0] || rvStatus.id === +(this.fm.controls.rvStatus.value ?? 0)) &&
                      (!this.#isEdit || modificationType === this.fm.controls.modificationType.value) &&
                      cvorNscType.id === +(this.fm.controls.cvorNscType.value ?? 0),
                    // mode,
                    // type,
                    // role,
                    rv,
                    !this.#isEdit || rv !== this.rvs[0] ? '-' : rvStatus.name,
                    !this.#isEdit ? '-' : modificationType,
                    cvorNscType.name,
                    this.cvirObject.cvirStatus,
                    this.cvir.cvirStatus
                  ]);
                });
              });
            });
          });
          this.outputTable = this.outputTable
            .map(x => x.join('_'))
            .filter((v, i, s) => s.indexOf(v) === i)
            .map(x => x.split('_'))
            .map(x => {
              x[0] = x[0] === 'true';
              return x;
            });

          this.#selectedVerificationStatusId = +(this.fm.controls.rvStatus.value ?? 0);
          this.#modificationType = this.fm.controls.modificationType.value ?? '';
          this.cvir.cvirVehicles[0].cvorTypeVehicle = +(this.fm.controls.cvorNscType.value ?? 0);
          this.cvirObject.cvirVehicles[0].cvorTypeVehicle = this.fm.controls.cvorNscTypeChanged.value ? 0 : this.cvir.cvirVehicles[0].cvorTypeVehicle;

          this.#decideCvirStatus(this.cvir);
        })
      )
      .subscribe();
  }

  onRowClick(row: any[]) {
    this.fm.patchValue({
      rv: row[1],
      // rvStatus: `${this.rvStatuses.find((f) => f.name === row[2])?.id ?? 0}`,
      cvorNscType: `${this.cvorNscList.find(f => f.name === row[4])?.id ?? 0}`
    });
    if (row[2] !== '-') {
      this.fm.controls.rvStatus.patchValue(`${this.rvStatuses.find(f => f.name === row[2])?.id ?? 0}`);
    }
    if (row[3] !== '-') {
      this.fm.controls.modificationType.patchValue(row[3]);
    }
  }

  #decideCvirStatus(cvir: any) {
    if (!this.#auth.isOnlineMode()) {
      cvir.cvirStatus = this.#statusNewCvirId;
      // cvir.prevCvirStatus = this.statusNewCvirId;
    } else {
      if (this.userRole === 'Administrator') {
        cvir.cvirStatus = this.#statusAcceptedId;
        // cvir.prevCvirStatus = this.statusAcceptedId;
      } else {
        if (this.checkIfHasRepairVerification()) {
          //cvir.cvirStatus = this.statusPendingVerificationId    //number //at create cvirStatus == prevCvirStatus (review) based on role in dev 9833
          //cvir.prevCvirStatus = this.statusPendingVerificationId
          // if (this.isReceivedStatus === true) {
          //   cvir.cvirStatus = this.statusAcceptedId;
          //   cvir.prevCvirStatus = this.statusAcceptedId;
          // } else {
          cvir.cvirStatus = this.#statusAcceptedId;
          // cvir.prevCvirStatus = this.statusAcceptedId;
          // }
        } else {
          if (this.#isEdit && this.#modificationType === 'greaterThan24hrs') {
            // cvir.prevCvirStatus = this.cvirObject?.cvirStatus;
            cvir.cvirStatus = this.#statusAcceptedId;
            //cvir.prevCvirStatus = this.statusNewCvirId
          } else {
            cvir.cvirStatus = this.#statusAcceptedId;
            // cvir.prevCvirStatus = this.statusAcceptedId;
          }
        }
      }
      if (
        // 37400
        this.cvorNscList
          ?.filter(({ code }) => code === 'YES-NO-NUMBER' || code === 'YES-NOT-REQUIRED')
          .map(({ id }) => id)
          .includes(cvir.cvirVehicles[0]?.cvorTypeVehicle)
      ) {
        cvir.cvirStatus = this.#statusNewCvirId;
        // cvir.prevCvirStatus = this.statusNewCvirId;
        if (this.#isEdit) {
          console.log('---', this.cvirObject?.cvirStatus, this.#statusOverdueId);
          // cvir.prevCvirStatus = this.cvirObject?.cvirStatus;
          if (this.cvirObject?.cvirStatus === this.#statusAcceptedId) {
            if (
              this.userRole === 'Officer' &&
              this.#modificationType === 'lessThan24hrs' &&
              this.cvirObject?.cvirVehicles[0]?.cvorTypeVehicle !== cvir.cvirVehicles[0]?.cvorTypeVehicle
            ) {
              cvir.cvirStatus = this.#statusNewCvirId;
            } else {
              cvir.cvirStatus = this.#statusAcceptedId;
            }
          } else if (this.cvirObject?.cvirStatus === this.#statusOverdueId) {
            if (
              this.userRole === 'Officer' &&
              this.checkIfHasRepairVerification() &&
              (this.#selectedVerificationStatusId === this.#receivedStatusId || this.#selectedVerificationStatusId === this.#notReceivedStatusId)
            ) {
              cvir.cvirStatus = this.#statusAcceptedId;
            } else {
              cvir.cvirStatus = this.#statusOverdueId;
            }
          }
        }
      }
      if (this.#isEdit && (this.cvirObject?.cvirStatus === this.#statusRejectedId || this.cvirObject?.cvirStatus === this.#statusNewCvirId)) {
        cvir.cvirStatus = this.#statusNewCvirId;
        // cvir.prevCvirStatus = this.cvirObject?.cvirStatus;
      }
    }

    /// new task
    if (
      this.#auth.isOnlineMode() &&
      ((!this.#trackInputPopulation.cvorNsc.populated && this.#getCvorNSCIdCodeById(cvir?.cvirVehicles[0].cvorTypeVehicle) === 'YES-NUMBER') ||
        (!this.#trackInputPopulation.driverLicense.populated && this.selectedLevel !== '5' && !cvir?.cvirDriver?.driverLicenceNotAvailable) ||
        !this.#trackInputPopulation.plates.every(x => x.populated))
    ) {
      cvir.cvirStatus = this.#statusNewCvirId;
    }
  }

  #getCvorNSCIdCodeById(id: number): string {
    return (
      this.cvorNscList?.find(x => {
        return x?.id === id;
      })?.code ?? '---'
    );
  }
}
