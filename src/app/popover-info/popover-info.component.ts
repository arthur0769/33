import { Component, Input, OnInit,  } from '@angular/core';

@Component({
  selector: 'app-popover-info',
  templateUrl: './popover-info.component.html',
  styleUrls: ['./popover-info.component.scss'],
})
export class PopoverInfoComponent  implements OnInit {

  @Input() isOnline: boolean;

  constructor() { }

  ngOnInit() {}

}
